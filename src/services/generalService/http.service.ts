/* eslint-disable @typescript-eslint/no-explicit-any */
import { isUseClient } from '@/utils/func/general.utils';
import { forceConvertToString, isFile, literalObjectLength } from '@/utils/func/dataType.utils';
import {
  defaultSecurityEndpoint,
  errorHandling,
  errorLogs,
  getToken,
  internetConnection,
  isValidUrl,
  responseFile,
  successLogs,
  validateApiResponse,
  validateBodyWithGetMethod,
} from '@/services/generalService/utils/request-functions.utils';
import {
  IRequestOptions,
  IResponse,
  IIsValidOptions,
  Method,
} from '@/services/generalService/types/request-data.types';
import { ILoaderState } from '@/store/loader/loaderStore';

/**
funcion general para llamar a API */
export async function httpService<T = any>(
  method: Method,
  url: string = '',
  options: IRequestOptions = {}
): Promise<IResponse | any> {
  // validar URL q llama al endpoint
  const _isValidUrl: IIsValidOptions | IResponse = isValidUrl({ url, method, options });
  if ((_isValidUrl as any)?.valid !== true) return _isValidUrl;

  // validar q tenga conexion a internet
  // window?.navigator?.onLine no siempre funciona
  const _internetConnection: IIsValidOptions | IResponse = internetConnection({
    url,
    method,
    options,
  });
  if ((_internetConnection as any)?.valid !== true) return _internetConnection;

  const {
    body,
    queryParams,
    headers = {},
    responseType = 'json',
    showLoader = true,
    validateResponse = true,

    // enviar token en TODOS los endpoint, EXCEPTO los q estan en const unprotectedURLs: string[]
    isASecurityEndpoint = defaultSecurityEndpoint(url),
    credentials = 'same-origin',
  } = options;

  // Validar que el método GET NO tenga body
  const _validateBodyWithGetMethod: IIsValidOptions | IResponse = validateBodyWithGetMethod({
    url,
    method,
    options,
  });
  if ((_validateBodyWithGetMethod as any)?.valid !== true) return _validateBodyWithGetMethod;

  // loader global q se muestra y oculta en componentes cliente 'use client'
  let loaderStore: ILoaderState | null = null;

  // acceder al valor booleano del loader
  if (isUseClient() && showLoader) {
    const { useLoaderStore } = await import('@/store/loader/loaderStore');
    loaderStore = useLoaderStore.getState();
    loaderStore.showLoader();
  }

  // Construir encabezados
  let finalHeaders: HeadersInit = {};

  if (literalObjectLength(headers) > 0) {
    finalHeaders = Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key, String(forceConvertToString(value))])
    );
  }

  // No establecer 'Content-Type' si el body es un archivo
  if (!isFile(body)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  // Agregar token si el endpoint lo necesita
  if (isASecurityEndpoint) {
    const token = await getToken();

    if (token) {
      finalHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      const message: string =
        'NO se pudo obtener token en el ' +
        (isUseClient() ? "CLIENTE 'use client'" : "SERVIDOR 'use server'") +
        ' \ntoken ' +
        token;

      errorLogs({
        message,
        method,
        url,
        options,
      });

      if (showLoader) {
        loaderStore?.hideLoader();
      }

      return { success: false, status: 401, message, data: [] };
    }
  }

  // Convertir queryParams si el endpoint es por query
  const queryString = queryParams
    ? `?${new URLSearchParams(queryParams as Record<string, string>).toString()}`
    : '';
  const requestUrl: string = `${url}${queryString}`;

  // Configurar opciones de fetch
  const fetchOptions: RequestInit = {
    method,
    headers: finalHeaders,
    credentials,
  };

  if (body) {
    // enviar body directamente cuando el body contiene un archivo (FormData)
    if (isFile(body)) {
      fetchOptions.body = body;
    } else {
      // cuando se envia un JSON y NO se hace JSON.stringify el backend de NestJS da error
      fetchOptions.body = JSON.stringify(body);
    }
  }

  // variable q usa fetch para llamar a la API
  let response: Response | null | any = null;

  // intenta convertir la respuesta de la API a 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData'
  // y guarda la respuesta de la API
  let result: null | any = null;

  try {
    response = await fetch(requestUrl, fetchOptions);

    if (responseType === 'json') {
      result = (await response.json()) as T;
    } else if (responseType === 'text') {
      result = (await response.text()) as T;
    } else if (['blob', 'arrayBuffer', 'formData'].includes(responseType)) {
      result = (await responseFile(
        response,
        responseType,
        method,
        url,
        options,
        `error la API respondió con tipo JSON y se espera un tipo responseType ${responseType}`
      )) as T;
    } else {
      result = response;

      errorLogs({
        message: `formato de respuesta responseType ${responseType} no valido en http.service.ts`,
        method,
        url,
        options,
        result,
        response,
      });
    }

    if (!response || response?.ok === false || !result || result?.success === false) {
      errorLogs({
        message: 'al ejecutar peticion HTTP',
        method,
        url,
        options,
        result,
        response,
      });

      // saltar al catch y capturar el error dependiendo del status de la respuesta
      throw new Error(JSON.stringify(result));
    } else {
      successLogs({
        method,
        url,
        options,
        result,
        response,
      });
    }
  } catch (error: any) {
    let parsedError: IResponse | null = null;

    try {
      if (error?.message) {
        parsedError = JSON?.parse(error.message);
      }
    } catch {
      console.error('❌ no se pudo capturar error de la API \n', error);
    }

    const { status } = parsedError ?? {};

    errorHandling(status, url);
  } finally {
    // ocultar loader en componente cliente 'use cliente'
    if (isUseClient() && showLoader) {
      if (loaderStore) {
        loaderStore.hideLoader();
      } else {
        errorLogs({
          message: "error al OCULTAR icono de loader en componente cliente 'use cliente'",
          method,
          url,
          options,
          result,
        });
      }
    }
  }

  // retornar respuesta de la API sin importar si fue exitosa o no
  if (validateResponse) {
    // forzar a q la API responda con el tipo IResponse ó con un archivo
    return validateApiResponse({ result, response, responseType, method, url, options });
  } else {
    // la API puede responder con lo q sea
    return result;
  }
}
