import React, { useState, useEffect, useRef } from 'react';
import { SimThread, LogMensagem } from '../types';

export const ConcurrencySimulator: React.FC = () => {
  // Parameters
  const [modelType, setModelType] = useState<'SEM_CONTROLE' | 'VERSIONAMENTO'>('SEM_CONTROLE');
  const [threadCount, setThreadCount] = useState<number>(50);
  const [amountPerTx, setAmountPerTx] = useState<number>(10);
  const [txType, setTxType] = useState<'DEPOSITO' | 'SAQUE'>('DEPOSITO');
  const [delayMultiplier, setDelayMultiplier] = useState<number>(30); // scale for simulation speed

  // State of the Sim Account
  const [accountBalance, setAccountBalance] = useState<number>(1000);
  const [accountVersion, setAccountVersion] = useState<number>(0);
  const [accountName, setAccountName] = useState<string>("João");

  // State of Threads and Logs
  const [threads, setThreads] = useState<SimThread[]>([]);
  const [logs, setLogs] = useState<LogMensagem[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simResults, setSimResults] = useState<{
    totalReq: number;
    successCount: number;
    lockFailCount: number;
    finalBalance: number;
    theoreticalBalance: number;
    lostAmount: number;
  } | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Sync basic account info when model types toggle
  useEffect(() => {
    if (modelType === 'SEM_CONTROLE') {
      setAccountBalance(1000);
      setAccountName("João");
      setAccountVersion(0);
    } else {
      setAccountBalance(1000);
      setAccountName("Maria");
      setAccountVersion(0);
    }
    setSimResults(null);
    setLogs([]);
    setThreads([]);
  }, [modelType]);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (texto: string, origem: 'SISTEMA' | 'CONTA_COMUM' | 'CONTA_VERSIONADA', tipo: 'INFO' | 'SUCESSO' | 'ALERTA' | 'PERIGO' = 'INFO') => {
    const newLog: LogMensagem = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString(),
      origem,
      tipo,
      texto
    };
    setLogs(prev => [...prev, newLog]);
  };

  const resetSim = () => {
    setIsRunning(false);
    setAccountBalance(1000);
    setAccountVersion(0);
    setThreads([]);
    setLogs([]);
    setSimResults(null);
  };

  const startSimulation = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setSimResults(null);
    setLogs([]);

    const activeBalanceRef = { current: 1000 };
    const activeVersionRef = { current: 0 };
    setAccountBalance(1000);
    setAccountVersion(0);

    const isUncontrolled = modelType === 'SEM_CONTROLE';
    const activeOrigem = isUncontrolled ? 'CONTA_COMUM' : 'CONTA_VERSIONADA';

    addLog(`Iniciando simulação com ${threadCount} threads concorrentes de ${txType}...`, 'SISTEMA', 'INFO');
    addLog(`Saldo Inicial do Banco: R$ 1000.00 ${isUncontrolled ? '' : '(Versão: 0)'}`, activeOrigem, 'INFO');

    // Create threads array
    const initialThreads: SimThread[] = Array.from({ length: threadCount }).map((_, idx) => ({
      id: idx + 1,
      tipo: txType,
      valor: amountPerTx,
      status: 'PENDENTE',
      progresso: 0
    }));
    setThreads(initialThreads);

    // Track statistics
    let successes = 0;
    let lockFails = 0;

    // Helper to sleep for simulation timing
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // We trigger all 50 threads *concurrently*.
    // To simulate realistic race condition overlapping:
    // Every thread starts nearly at the same time (spaced by 5-15ms for staggered visual but overlapping execution windows).
    const threadPromises = initialThreads.map(async (th) => {
      // 1. Initial wait to stagger thread start visually
      const staggeredDelay = Math.random() * delayMultiplier * 8;
      await sleep(staggeredDelay);

      // Transition to LEASED/READING
      updateThreadStatus(th.id, 'LENDO', 20);
      
      // Store READ database values
      const balanceRead = activeBalanceRef.current;
      const versionRead = activeVersionRef.current;

      addLog(`[Thread-${th.id}] Lendo dados do DB: R$ ${balanceRead.toFixed(2)} ${isUncontrolled ? '' : `(Versão: ${versionRead})`}`, activeOrigem, 'INFO');
      updateThreadStatus(th.id, 'LENDO', 40, balanceRead, versionRead);

      // 2. Processing / calculating delay
      const computationDelay = (15 + Math.random() * 20) * delayMultiplier;
      await sleep(computationDelay);

      updateThreadStatus(th.id, 'CALCULANDO', 70);
      const computedValue = th.tipo === 'DEPOSITO' 
        ? balanceRead + th.valor 
        : balanceRead - th.valor;

      if (computedValue < 0) {
        // Safe check
        addLog(`[Thread-${th.id}] Reprovado: SaldoInsuficienteException.`, activeOrigem, 'PERIGO');
        updateThreadStatus(th.id, 'ERRO_SALDO', 100, undefined, undefined, "Saldo Insuficiente");
        return;
      }

      // 3. Requesting commit (saving)
      const commitDelay = Math.random() * delayMultiplier * 3;
      await sleep(commitDelay);

      if (isUncontrolled) {
        // SEM CONTROLE:
        // Overwrite active database values directly with calculated old-state value
        activeBalanceRef.current = computedValue;
        setAccountBalance(computedValue);
        successes++;
        
        addLog(`[Thread-${th.id}] Gravando novo saldo: R$ ${computedValue.toFixed(2)} (Overwrite bem-sucedido!)`, activeOrigem, 'SUCESSO');
        updateThreadStatus(th.id, 'SUCESSO', 100);
      } else {
        // COM @VERSION (CONCORRÊNCIA OTIMISTA)
        // Verify if version has changed since thread read the database record
        if (versionRead === activeVersionRef.current) {
          // Commit succeeds
          activeBalanceRef.current = computedValue;
          activeVersionRef.current += 1;
          
          setAccountBalance(computedValue);
          setAccountVersion(activeVersionRef.current);
          successes++;

          addLog(`[Thread-${th.id}] Versão bateu! Commit efetuado. Saldo: R$ ${computedValue.toFixed(2)} | Nova Versão: ${activeVersionRef.current}`, activeOrigem, 'SUCESSO');
          updateThreadStatus(th.id, 'SUCESSO', 100);
        } else {
          // Commit fails due to Optimistic Lock
          lockFails++;
          addLog(`[Thread-${th.id}] ERROR 409: ObjectOptimisticLockingFailureException! Versão lida: ${versionRead}, Versão no DB: ${activeVersionRef.current}`, activeOrigem, 'PERIGO');
          updateThreadStatus(th.id, 'ERRO_LOCK', 100, undefined, undefined, "Erros de concorrência (@Version conflito)");
        }
      }
    });

    // Wait until all threads complete
    await Promise.all(threadPromises);

    // Compute theoretic outcomes
    const expectedDifference = txType === 'DEPOSITO' 
      ? threadCount * amountPerTx 
      : -1 * threadCount * amountPerTx;
    const theoretical = 1000 + expectedDifference;
    const finalBalance = activeBalanceRef.current;
    const lostAmount = Math.max(0, theoretical - finalBalance);

    addLog(`=== SIMULAÇÃO CONCLUÍDA ===`, 'SISTEMA', 'INFO');
    addLog(`Resultados Finais - Saldo Final no Banco: R$ ${finalBalance.toFixed(2)}`, 'SISTEMA', isUncontrolled && lostAmount > 0 ? 'ALERTA' : 'SUCESSO');

    setSimResults({
      totalReq: threadCount,
      successCount: successes,
      lockFailCount: lockFails,
      finalBalance,
      theoreticalBalance: theoretical,
      lostAmount: isUncontrolled ? lostAmount : 0
    });

    setIsRunning(false);
  };

  const updateThreadStatus = (
    id: number, 
    status: SimThread['status'], 
    progresso: number,
    valLido?: number,
    verLida?: number,
    msg?: string
  ) => {
    setThreads(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          progresso,
          valorLido: valLido !== undefined ? valLido : t.valorLido,
          versaoLida: verLida !== undefined ? verLida : t.versaoLida,
          mensagem: msg || t.mensagem
        };
      }
      return t;
    }));
  };

  return (
    <div id="concurrency-simulator-root" className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Param Control Panel */}
        <div id="sim-control-panel" className="w-full lg:w-1/3 bg-white p-5 border border-slate-200 rounded-xl space-y-4 shadow-sm">
          <div className="border-b pb-2">
            <h3 className="text-sm font-bold text-slate-800">Parâmetros de Concurrência</h3>
            <p className="text-[11px] text-slate-500">Configure o cenário para testar a consistência</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Abordagem de Banco</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="btn-model-sem-controle"
                type="button"
                onClick={() => setModelType('SEM_CONTROLE')}
                disabled={isRunning}
                className={`py-2 px-3 text-xs rounded-lg border font-medium transition duration-205 text-center ${
                  modelType === 'SEM_CONTROLE'
                    ? 'bg-rose-50 border-rose-400 text-rose-700 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                } disabled:opacity-50`}
              >
                🔴 Sem Controle (Par. 1)
              </button>
              <button
                id="btn-model-versionamento"
                type="button"
                onClick={() => setModelType('VERSIONAMENTO')}
                disabled={isRunning}
                className={`py-2 px-3 text-xs rounded-lg border font-medium transition duration-205 text-center ${
                  modelType === 'VERSIONAMENTO'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                } disabled:opacity-50`}
              >
                🟢 Otimista @Version (Par. 2)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Threads Simultâneas ({threadCount})</label>
            <input
              id="slider-thread-count"
              type="range"
              min="10"
              max="50"
              step="5"
              value={threadCount}
              onChange={(e) => setThreadCount(Number(e.target.value))}
              disabled={isRunning}
              className="w-full accent-emerald-600 mb-1"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>10 threads</span>
              <span>30 threads</span>
              <span>50 threads</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pb-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Operação</label>
              <select
                id="select-tx-type"
                value={txType}
                onChange={(e) => setTxType(e.target.value as 'DEPOSITO' | 'SAQUE')}
                disabled={isRunning}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-700 outline-none"
              >
                <option value="DEPOSITO">Depósito (+)</option>
                <option value="SAQUE">Saque (-)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valor por Tx</label>
              <div className="relative">
                <span className="absolute left-2.5 top-2 text-xs font-semibold text-slate-400">R$</span>
                <input
                  id="input-amount-tx"
                  type="number"
                  value={amountPerTx}
                  onChange={(e) => setAmountPerTx(Number(e.target.value))}
                  disabled={isRunning}
                  className="w-full text-xs border border-slate-200 rounded-lg py-2 pl-7 pr-2 outline-none text-slate-800 font-medium font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Velocidade da Animação</label>
            <select
              id="select-speed"
              value={delayMultiplier}
              onChange={(e) => setDelayMultiplier(Number(e.target.value))}
              disabled={isRunning}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-white text-slate-700 outline-none font-mono"
            >
              <option value="80">Lenta (Foco em Análise)</option>
              <option value="30">Média (Recomendado)</option>
              <option value="10">Rápida (Velocidade Máxima)</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              id="btn-trigger-simulation"
              type="button"
              onClick={startSimulation}
              disabled={isRunning}
              className={`flex-1 py-3 px-4 text-xs font-bold rounded-xl text-white shadow transition-all duration-200 active:scale-95 ${
                modelType === 'SEM_CONTROLE'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              } disabled:opacity-50 disabled:pointer-events-none`}
            >
              🚀 Iniciar Simulador Concorrente
            </button>
            <button
              id="btn-reset-simulator"
              type="button"
              onClick={resetSim}
              disabled={threads.length === 0}
              className="py-3 px-3 text-xs bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl font-semibold active:scale-95 transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Board & Active Visual State (Middle/Right) */}
        <div id="sim-board-right" className="flex-1 flex flex-col gap-5">
          {/* Virtual Database State Card */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-inner border border-slate-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full animate-pulse ${modelType === 'SEM_CONTROLE' ? 'bg-rose-500' : 'bg-emerald-400'}`}></span>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold font-mono">Baco de Dados H2 Simulado</span>
              </div>
              <h3 className="text-lg font-bold mt-1 text-slate-100">
                Conta de {accountName} <span className="text-xs text-slate-400 font-normal">(ID: 1)</span>
              </h3>
            </div>
            <div className="flex gap-4">
              <div className="bg-slate-950/60 px-4 py-2 rounded-lg border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 font-semibold">SALDO NO DB</div>
                <div className="text-xl font-bold font-mono text-emerald-400">R$ {accountBalance.toFixed(2)}</div>
              </div>
              {modelType === 'VERSIONAMENTO' && (
                <div className="bg-slate-950/60 px-4 py-2 rounded-lg border border-slate-800 text-center select-none">
                  <div className="text-[10px] text-slate-400 font-semibold">VERSION (JPA)</div>
                  <div className="text-xl font-bold font-mono text-amber-400">{accountVersion}</div>
                </div>
              )}
            </div>
          </div>

          {/* Grid threads visualization */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex-1">
            <h4 className="text-xs font-bold text-slate-700/85 mb-3 flex items-center justify-between">
              <span>Pool de Threads Concorrentes ({threads.length > 0 ? threads.length : 'Ocioso'})</span>
              <div className="flex gap-3 text-[10px] font-medium text-slate-500 font-mono">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-slate-100 border rounded"></span> Pendente</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-yellow-100 border border-yellow-300 rounded"></span> Lendo</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded"></span> Sucesso</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-rose-500 rounded"></span> Erro Lock</span>
              </div>
            </h4>

            {threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
                <svg className="w-10 h-10 mb-2 stroke-slate-300" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6a9 9 0 0 1 0 18H12m0-18V2.25M12 6a9 9 0 0 0 0 18M12 2.25H9M12 2.25h3m-3 0V6" />
                </svg>
                <p className="text-xs">Configure os parâmetros e clique em iniciar para ver as threads trabalharem concorrentemente.</p>
              </div>
            ) : (
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-[160px] overflow-y-auto scrollbar-thin p-1">
                {threads.map((th) => {
                  let badgeColor = "bg-slate-50 text-slate-500 border-slate-250";
                  if (th.status === 'LENDO') badgeColor = "bg-yellow-100 text-yellow-800 border-yellow-350 animate-pulse";
                  if (th.status === 'CALCULANDO') badgeColor = "bg-amber-100 text-amber-800 border-amber-300";
                  if (th.status === 'SUCESSO') badgeColor = "bg-emerald-500 text-white border-transparent";
                  if (th.status === 'ERRO_LOCK') badgeColor = "bg-rose-500 text-white border-transparent";
                  if (th.status === 'ERRO_SALDO') badgeColor = "bg-red-700 text-white border-transparent";

                  return (
                    <div
                      key={th.id}
                      id={`thread-badge-${th.id}`}
                      title={`Thread #${th.id}: ${th.status} ${th.valorLido !== undefined ? `| Leu: R$${th.valorLido}` : ''}`}
                      className={`py-2 border text-center text-[10px] font-mono font-bold rounded-lg transition-all duration-300 ${badgeColor}`}
                    >
                      T{th.id}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats and Terminal logs section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        
        {/* Terminal Logs Logger */}
        <div className="md:col-span-2 bg-slate-950 border border-slate-900 text-slate-200 rounded-xl p-4 shadow-inner flex flex-col h-[280px]">
          <div className="border-b border-slate-800 pb-2 mb-2 flex justify-between items-center text-[10px] font-mono text-slate-400 select-none">
            <span>CONSOLE DE MONITORAMENTO COMPOSTO</span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> CONECTADO AO LOG H2
            </span>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin text-[10px] font-mono space-y-1.5 p-1">
            {logs.length === 0 ? (
              <span className="text-slate-600 block italic">AGUARDANDO COMMITS...</span>
            ) : (
              logs.map((log) => {
                let colorClass = "text-slate-300";
                if (log.tipo === 'SUCESSO') colorClass = "text-emerald-400 font-bold";
                if (log.tipo === 'ALERTA') colorClass = "text-amber-400";
                if (log.tipo === 'PERIGO') colorClass = "text-rose-400 font-bold";

                return (
                  <div key={log.id} id={`log-${log.id}`} className="hover:bg-slate-900/50 py-0.5 leading-relaxed">
                    <span className="text-slate-500 select-none mr-2 font-light">[{log.timestamp}]</span>
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold mr-2 uppercase ${
                      log.origem === 'CONTA_COMUM' ? 'bg-rose-950 text-rose-300 border border-rose-800/40' :
                      log.origem === 'CONTA_VERSIONADA' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {log.origem}
                    </span>
                    <span className={colorClass}>{log.texto}</span>
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        {/* Simulation analytical conclusion summary */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h4 className="text-xs font-bold text-slate-800 border-b pb-2 mb-3">Relatório da Rodada</h4>
          
          {simResults ? (
            <div id="sim-report-results" className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Total de Op. Concorrentes:</span>
                <span className="font-bold font-mono text-slate-700">{simResults.totalReq}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Commits Bem Sucedidos:</span>
                <span className="font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {simResults.successCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Colisões Abortadas:</span>
                <span className="font-bold font-mono text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  {simResults.lockFailCount}
                </span>
              </div>
              <div className="border-t border-dashed my-2 pt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Saldo Teórico Esperado:</span>
                  <span className="font-mono text-slate-700">R$ {simResults.theoreticalBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-800 font-semibold">Saldo Final Obtido:</span>
                  <span className="font-mono font-bold text-slate-900 border-b-2">R$ {simResults.finalBalance.toFixed(2)}</span>
                </div>
              </div>

              {modelType === 'SEM_CONTROLE' && simResults.lostAmount > 0 ? (
                <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-[11px] text-rose-800">
                  <div className="font-bold mb-1">⚠️ Fenômeno LOST UPDATE:</div>
                  O saldo final ficou <span className="font-bold">R$ {simResults.lostAmount.toFixed(2)} abaixo</span> do esperado! Conexões simultâneas sobrescreviam o saldo lido, perdendo transações silenciosamente.
                </div>
              ) : modelType === 'VERSIONAMENTO' && simResults.lockFailCount > 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-[11px] text-emerald-800">
                  <div className="font-bold mb-1">✔️ Consistência Garantida:</div>
                  Nenhuma transação foi perdida silenciosamente! As colisões foram anuladas gerando as exceções de concorrência. O saldo no DB é estritamente verdadeiro para os commits salvos.
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-[11px] text-blue-800 italic">
                  Pronto para a verificação académica. O resultado de consistência depende de processos concorrentes integrados no mesmo intervalo.
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[180px] text-center text-slate-400">
              <svg className="w-8 h-8 opacity-60 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25H5.625A2.25 2.25 0 0 1 3.375 18V6.125c0-.621.504-1.125 1.125-1.125H9.75M8.25 21h8.25" />
              </svg>
              <p className="text-xs">Nenhum teste executado nesta sessão.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
