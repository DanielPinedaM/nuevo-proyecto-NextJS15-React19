/* eslint-disable @typescript-eslint/no-explicit-any */

export type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
parametros de funcion httpRequest para llamar a la API */
export type IResponseType = 'json' | 'text' | 'blob';

export interface IRequestOptions {
  isASecurityEndpoint?: boolean;
  body?: any;
  queryParams?: Record<string, string | number | boolean | (string | number | boolean)[]>;
  headers?: Record<string, string | number>;
  responseType?: IResponseType;
}

/**
parametros de funcion errorLogs() q se imprimen por consola  cuando hay errores */
export interface IObjectLogs {
  message?: string;
  method?: Method;
  url?: string;
  options?: IRequestOptions;
  result?: IResponse;
  response?: Response;
}

interface IData {
  timestamp: string;
  path: string;
  error: string | null;
}

/**
asi es como responde la api de NestJS */
export interface IResponse {
  success: boolean;
  status: number;
  message: string;
  data: IData | any;
}

/**
validar respuesta del backend */
export interface IValidateApiResponse {
  result: IResponse | any;
  responseType: IResponseType;
  method: Method;
  url: string;
  options: IRequestOptions;
  response: Response;
}
