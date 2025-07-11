/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpRequest } from "@/services/generalService/httpRequest";
import { IResponse } from "@/services/generalService/types/requestDataTypes";
import { IFormCreateTable } from "@/types/interface/interface-nombre-tabla";

/**
listar y buscar data de tabla llamada "nombre-tabla" */
export async function listTableData(search: string): Promise<IResponse> {
  const response: IResponse = await httpRequest(
    "POST",
    `${process.env.NEXT_PUBLIC_}${search ? "/" + search : ""}`
  );

  return response;
}

/**
peticion de ventana modal para guardar nueva tabla */
export async function createTable(body: IFormCreateTable): Promise<IResponse> {
  const response: IResponse = await httpRequest("POST", `${process.env.NEXT_PUBLIC_}`, { body });

  return response;
}

/**
peticion de ventana modal q hace una pregunta */
export async function acceptValidation(): Promise<IResponse> {
  const response: IResponse = await httpRequest("POST", `${process.env.NEXT_PUBLIC_}`);

  return response;
}
