/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ContaBancaria {
  id: number;
  titular: string;
  saldo: number;
}

export interface ContaBancariaVersionada {
  id: number;
  titular: string;
  saldo: number;
  version: number;
}

export interface SimThread {
  id: number;
  tipo: 'DEPOSITO' | 'SAQUE';
  valor: number;
  status: 'PENDENTE' | 'LENDO' | 'CALCULANDO' | 'SUCESSO' | 'ERRO_LOCK' | 'ERRO_SALDO';
  progresso: number; // 0 a 100
  valorLido?: number;
  versaoLida?: number;
  mensagem?: string;
}

export interface LogMensagem {
  id: string;
  timestamp: string;
  origem: 'SISTEMA' | 'CONTA_COMUM' | 'CONTA_VERSIONADA';
  tipo: 'INFO' | 'SUCESSO' | 'ALERTA' | 'PERIGO';
  texto: string;
}
