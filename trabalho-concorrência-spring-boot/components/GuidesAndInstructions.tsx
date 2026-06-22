import React, { useState } from 'react';

export const GuidesAndInstructions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'JMETER' | 'POSTMAN' | 'EXPLICACAO'>('EXPLICACAO');

  return (
    <div id="guides-container" className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md">
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 bg-slate-50/50">
        <button
          id="btn-guide-explicacao"
          onClick={() => setActiveTab('EXPLICACAO')}
          className={`flex-1 py-3 text-center text-sm font-medium transition duration-200 ${
            activeTab === 'EXPLICACAO'
              ? 'border-b-2 border-emerald-600 text-emerald-700 bg-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 border-b-2 border-transparent'
          }`}
        >
          🎓 Conceitos & Comportamento
        </button>
        <button
          id="btn-guide-jmeter"
          onClick={() => setActiveTab('JMETER')}
          className={`flex-1 py-3 text-center text-sm font-medium transition duration-200 ${
            activeTab === 'JMETER'
              ? 'border-b-2 border-emerald-600 text-emerald-700 bg-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 border-b-2 border-transparent'
          }`}
        >
          ⚡ Guia Completo JMeter
        </button>
        <button
          id="btn-guide-postman"
          onClick={() => setActiveTab('POSTMAN')}
          className={`flex-1 py-3 text-center text-sm font-medium transition duration-200 ${
            activeTab === 'POSTMAN'
              ? 'border-b-2 border-emerald-600 text-emerald-700 bg-white font-semibold'
              : 'text-slate-600 hover:text-slate-900 border-b-2 border-transparent'
          }`}
        >
          🚀 Guia Postman & H2
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'EXPLICACAO' && (
          <div id="guide-content-explicacao" className="space-y-6">
            <div className="border-l-4 border-amber-500 bg-amber-550/5 p-4 rounded-r-lg">
              <h4 className="text-amber-800 font-bold text-sm mb-1">Entendendo a Concorrência em Sistemas de Informação</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Quando múltiplos usuários ou threads tentam atualizar o mesmo registro simultaneamente em um banco de dados, ocorrem fenômenos de concorrência. Se não houver controle, o saldo final ficará inconsistente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Parte 1 */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700 text-xs font-bold font-mono">1</span>
                  <h4 className="text-slate-800 font-bold text-sm">Sem Controle (ContaBancaria)</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc list-inside">
                  <li><strong className="text-slate-700">Lost Update (Atualização Perdida):</strong> Duas transações carregam o saldo de R$ 1000.00 ao mesmo tempo. Ambas adicionam R$ 10.00. No fim do commit, a segunda transação grava R$ 1010.00, sobresscrevendo a primeira sem saber, perdendo um dos depósitos!</li>
                  <li><strong className="text-slate-700">Comportamento:</strong> As atualizações se sobrepõem perigosamente. Com 50 threads fazendo 10 loops de R$ 10.00, o saldo deveria ir de R$ 1000 para R$ 1500, mas acaba parando em R$ 1010 ou R$ 1050.</li>
                  <li><strong className="text-slate-700">Transação:</strong> A transação `@Transactional` apenas agrupa as operações em bloco, mas não impede a leitura suja/concorrente do mesmo registro em nível de aplicação.</li>
                </ul>
              </div>

              {/* Parte 2 */}
              <div className="bg-emerald-50/20 border border-emerald-100 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold font-mono">2</span>
                  <h4 className="text-slate-800 font-bold text-sm">Controle Otimista (ContaBancariaVersionada)</h4>
                </div>
                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed list-disc list-inside">
                  <li><strong className="text-slate-700">Mecanismo do @Version:</strong> O Hibernate injeta um número de versão no objeto. Ao atualizar, gera o SQL: <em className="text-slate-500 font-mono">UPDATE ... WHERE version = versao_lida</em>.</li>
                  <li><strong className="text-slate-700">Se a versão mudar:</strong> O Hibernate sabe que outro thread gravou no meio do caminho. Ele aborta a transação atual imediatamente lançando a exceção <strong className="text-emerald-700">ObjectOptimisticLockingFailureException</strong>.</li>
                  <li><strong className="text-slate-700">Garantia de Consistência:</strong> Nenhum dado é perdido de forma silenciosa. A aplicação impede inconsistências retornando um status HTTP <strong className="text-emerald-700">409 Conflict</strong>, informando para tentar novamente.</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-slate-900 text-white rounded-lg p-5 font-mono text-xs">
              <div className="text-slate-400 mb-2">// Como o Hibernate gera a query na concorrência otimista:</div>
              <div className="text-emerald-400 font-semibold">UPDATE <span className="text-white">conta_bancaria_versionada</span></div>
              <div className="pl-4 font-semibold text-emerald-400">SET <span className="text-white">saldo = 1010.00, version = 2</span></div>
              <div className="pl-4 font-semibold text-emerald-400">WHERE <span className="text-white">id = 1 AND version = 1;</span></div>
              <div className="mt-3 text-rose-400 font-medium">-- Se 0 linhas forem afetadas: lança ObjectOptimisticLockingFailureException!</div>
            </div>
          </div>
        )}

        {activeTab === 'JMETER' && (
          <div id="guide-content-jmeter" className="space-y-5">
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-lg">
              <div>
                <h4 className="text-slate-800 font-bold text-sm">Subindo o Plano de Testes Pronto</h4>
                <p className="text-xs text-slate-500 mt-1">Este projeto já contém um arquivo <code className="bg-slate-200 px-1 py-0.5 rounded text-xs">concorrencia_jmeter_test_plan.jmx</code> pronto em <code className="bg-slate-200 px-1.5 py-0.5 rounded text-xs select-all">/test-artifacts</code>.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded font-bold font-mono text-[10px] whitespace-nowrap">PLUG & PLAY</span>
            </div>

            <div className="space-y-4">
              <h4 className="text-slate-800 font-bold text-sm border-b pb-1">Passo a Passo de Execução no Apache JMeter</h4>
              
              <ol className="list-decimal list-inside space-y-3 text-xs text-slate-600 leading-relaxed">
                <li>Abra o <strong className="text-slate-800">Apache JMeter</strong> no seu computador.</li>
                <li>Vá em <strong className="text-slate-800">File &gt; Open</strong> e escolha o arquivo <strong className="text-slate-800">concorrencia_jmeter_test_plan.jmx</strong> criado neste projeto.</li>
                <li>Expandindo a árvore do lado esquerdo, você verá:
                  <ul className="list-disc pl-6 py-1 space-y-1 text-slate-500">
                    <li><strong className="text-slate-600">Thread Group:</strong> Pré-configurado com <strong className="text-slate-600">50 Threads (usuários simultâneos)</strong> e <strong className="text-slate-600">10 Loops</strong> (cada thread manda 10 requisições).</li>
                    <li><strong className="text-slate-600">Gerenciador de Cabeçalho HTTP:</strong> Carregando <code className="bg-slate-100 px-1 py-0.5 text-[10px]">Content-Type: application/json</code>.</li>
                    <li><strong className="text-slate-600">POST Deposito - Sem @Version:</strong> Executações apontadas para <code className="bg-slate-100 px-1 py-0.5 text-[10px]">http://localhost:8080/contas/1/deposito</code>.</li>
                    <li><strong className="text-slate-600">POST Deposito - Com @Version (Otimista):</strong> Executações apontadas para <code className="bg-slate-100 px-1 py-0.5 text-[10px]">/contas-versionadas/1/deposito</code> (Vem desabilitado por padrão para você alternar).</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-slate-800">Cenário 1 e Cenário 2 (Concorrência Pura):</strong>
                  <br />
                  <span className="text-slate-500">Para testar o Sem @Version: Deixe o sampler comum habilitado (verde) e o versionado desabilitado (cinza). Limpe os resultados, clique no botão <strong className="text-slate-800">Start (Play verde superior)</strong> e observe a "Árvore de Resultados". Todas as 500 requisições darão HTTP 200 OK, mas faça um GET no banco: o saldo final estará muito abaixo do esperado (Lost Update).</span>
                </li>
                <li>
                  <strong className="text-slate-800">Cenário com @Version (Controle Otimista):</strong>
                  <br />
                  <span className="text-slate-500">Clique com botão direito no primeiro sampler e vá em <strong className="text-slate-800">Disable</strong>. Clique com botão direito no sampler versionado e escolha <strong className="text-slate-800">Enable</strong>. Execute de novo. Você notará inúmeros retornos vermelhos <strong className="text-rose-600 font-bold">409 Conflict</strong> no JMeter. Isto é maravilhoso: as colisões foram identificadas com sucesso e o banco protegeu o saldo!</span>
                </li>
                <li>
                  <strong className="text-slate-800">Cenário 3 (Mistura de Operações):</strong>
                  <br />
                  <span className="text-slate-500">Você pode habilitar ambos os samplers ao mesmo tempo ou criar um de saque duplicando os existentes para analisar o balanceamento de operações.</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'POSTMAN' && (
          <div id="guide-content-postman" className="space-y-5 text-xs text-slate-600 leading-relaxed">
            <div className="bg-emerald-50/20 border border-emerald-100 p-4 rounded-lg">
              <h4 className="text-emerald-800 font-bold text-sm mb-1">Como usar a collection do Postman inclusa</h4>
              <p>
                Importe o arquivo <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-700">/test-artifacts/concorrencia_postman_collection.json</code> no seu Postman para acessar os endpoints prontos com corpos de dados formatados.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-slate-800 font-bold text-sm border-b pb-1">Acesso ao Console Web do Banco H2</h4>
              <p>O Spring Boot roda o H2 embarcado em memória. Para inspecionar e gerenciar as tabelas diretamente pelo navegador:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong className="text-slate-700">URL de Acesso:</strong> <a href="http://localhost:8080/h2-console" target="_blank" rel="noreferrer" className="text-emerald-600 underline font-mono font-semibold">http://localhost:8080/h2-console</a></li>
                <li><strong className="text-slate-700">JDBC URL:</strong> <code className="bg-slate-100 px-1 py-0.5 font-mono select-all">jdbc:h2:mem:dbconcorrencia</code></li>
                <li><strong className="text-slate-700">Driver Class:</strong> <code className="bg-slate-100 px-1 py-0.5 font-mono">org.h2.Driver</code></li>
                <li><strong className="text-slate-700">User Name:</strong> <code className="bg-slate-100 px-1 py-0.5 font-mono">sa</code></li>
                <li><strong className="text-slate-700">Password:</strong> <span className="text-slate-400 italic">Deixe em branco (vazio)</span></li>
              </ul>
              <p className="mt-2 text-slate-500">Isso abrirá um painel SQL completo onde você pode rodar queries como <code className="bg-slate-150 px-1 py-0.5 font-mono">SELECT * FROM CONTA_BANCARIA;</code> para acompanhar os saldos e versões em tempo real.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
