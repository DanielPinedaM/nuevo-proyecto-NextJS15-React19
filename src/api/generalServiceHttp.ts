/* eslint-disable @typescript-eslint/no-explicit-any */
import Cookies from "js-cookie";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions<B = any> {
  isASecurityEndpoint?: boolean;
  body?: B;
  queryParams?: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >;
  headers?: Record<string, string | number>;
  responseType?: "json" | "text" | "blob";
}

export async function httpRequest<T = any, B = any>(
  method: Method,
  url: string = "",
  options: RequestOptions<B> = {}
): Promise<T> {
  if (typeof url !== "string" || String(url)?.trim() === "") {
    const errorMessage: string = "\n ❌ error la url tiene q ser tipo string y NO puede estar vacia '' \n";
    console.error(errorMessage, "la url es ", url)
    throw new Error(errorMessage);
  }

  const {
    isASecurityEndpoint = false,
    body,
    queryParams,
    headers,
    responseType = "json"
  } = options;

  // Agrega encabezados
  const finalHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers
  };

  // Agregar token si el endpoint lo necesita
  if (isASecurityEndpoint) {
    const token = getToken();
    console.log(token);

    if (token) {
      finalHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  // Convertir queryParams si el endpoint es por query
  const queryString = queryParams
    ? `?${new URLSearchParams(
        queryParams as Record<string, string>
      ).toString()}`
    : "";

  const requestUrl = `${url}${queryString}`;

  // Configurar la petición

  const fetchOptions: RequestInit = {
    method,
    headers: finalHeaders
  };

  if (body) {
    fetchOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(requestUrl, fetchOptions);

    if (!response.ok) {
      if (response.status === 401) {
        console.error("❌ error 401 no tiene autorizacion para realizar esta accion \n", response);
        handleUnauthorized();
      } else {
        console.error("\n ❌ error al ejecutar la petición HTTP \n", "metodo HTTP ", method, "\n", "url " + url, "\n");
      }
    }

    if (responseType === "json") {
      return (await response.json()) as T;
    } else if (responseType === "text") {
      return (await response.text()) as T;
    } else if (responseType === "blob") {
      return (await response.blob()) as T;
    } else {
      console.error("\n ❌ error formato de respuesta no valido \n", "metodo HTTP ", method, "\n", "url ", url, "\n", "response ", response, "\n", "responseType ", responseType, " \n")
    }

    const errorMessage: string = "❌ error tipo de respuesta no soportado \n ";
    console.error(errorMessage, "\n", response, "\n");
    throw new Error(errorMessage);
  } catch (error) {
    console.error("\n ❌ error al ejecutar la petición HTTP \n", error, "\n", "metodo HTTP ", method, "\n", "url " + url, "\n");
    throw error;
  }
}

function handleUnauthorized() {
  console.log("Cookies.get('token')", Cookies.get("token"));

  Cookies.remove("token");
}

function getToken(): string | null {
  const token = Cookies.get("token");
  if (token) {
    return token;
  } else {
    return null;
  }
}
