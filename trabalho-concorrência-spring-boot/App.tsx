/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ConcurrencySimulator } from './components/ConcurrencySimulator';
import { CodeViewer } from './components/CodeViewer';
import { GuidesAndInstructions } from './components/GuidesAndInstructions';

const App: React.FC = () => {
  const [activeViewTab, setActiveViewTab] = useState<'SIMULACAO' | 'CODIGOS' | 'MANUAIS'>('SIMULACAO');

  return (
    <div id="app-wrapper" className="min-h-screen bg-slate-50 text-slate-800 antialiased flex flex-col justify-between">
      
      {/* Upper Navigation Header */}
      <header id="app-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm transition duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg shadow-md shadow-emerald-200">
              ☕
            </span>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">Trabalho sobre Concorrência de DB</h1>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium font-mono">Spring Boot 3 + JPA / Hibernate + Banco H2</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aluno / Pesquisador</span>
              <span className="text-xs font-semibold text-slate-800 font-mono">gustavomodesto003@gmail.com</span>
            </div>
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              PRONTO PARA APRESENTAÇÃO
            </span>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main id="app-main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Academic Presentation Banner */}
        <div id="welcome-banner" className="bg-gradient-to-tr from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle decorative grid background and lights */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25"></div>
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full font-bold font-mono text-[10px] border border-emerald-500/20 uppercase tracking-widest">
                🔬 Sistemas de Bancos de Dados
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-100">
                Pessimistic vs Optimistic Locking & Consistência de Dados
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-light">
                Trabalho acadêmico completo com códigos-fonte integrados de controladores, serviços transacionais, entidades com <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded font-mono">@Version</code>, banco de dados relacional H2, roteiros de JMeter e Postman inclusos.
              </p>
            </div>
            
            {/* Quick Export Badge */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col items-center gap-1 whitespace-nowrap backdrop-blur-md select-none w-full md:w-auto">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">Download do Projeto</span>
              <span className="text-sm font-bold text-slate-200 mt-0.5 flex items-center gap-1">📂 Exportar Pasta como ZIP</span>
              <p className="text-[9px] text-slate-500 text-center leading-normal mt-1">Menu lateral &gt; Configurações do AI Studio<br />&gt; Export / ZIP do repositório completo</p>
            </div>
          </div>
        </div>

        {/* Presentation Sections Tabs selectors */}
        <div className="flex border-b border-slate-200 space-x-2 bg-white/50 p-1.5 rounded-xl border">
          <button
            id="tab-view-simulacao"
            type="button"
            onClick={() => setActiveViewTab('SIMULACAO')}
            className={`flex-1 sm:flex-initial py-2.5 px-6 rounded-lg text-xs font-bold transition duration-200 ${
              activeViewTab === 'SIMULACAO'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            📊 Simulador de Concorrência (Visual)
          </button>
          
          <button
            id="tab-view-codigos"
            type="button"
            onClick={() => setActiveViewTab('CODIGOS')}
            className={`flex-1 sm:flex-initial py-2.5 px-6 rounded-lg text-xs font-bold transition duration-200 ${
              activeViewTab === 'CODIGOS'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            📂 Códigos-Fonte Java completos
          </button>
          
          <button
            id="tab-view-manuais"
            type="button"
            onClick={() => setActiveViewTab('MANUAIS')}
            className={`flex-1 sm:flex-initial py-2.5 px-6 rounded-lg text-xs font-bold transition duration-200 ${
              activeViewTab === 'MANUAIS'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            🎓 Roteiro de Testes (JMeter, Postman, H2)
          </button>
        </div>

        {/* Primary View Router */}
        <div id="dynamic-view-panel" className="transition-all duration-300">
          {activeViewTab === 'SIMULACAO' && (
            <div id="view-simulator" className="space-y-4">
              <div className="flex flex-col gap-1.5 mb-1">
                <h3 className="text-base font-bold text-slate-900 tracking-tight">Ambiente de Simulação de Linhas de Execução (Threads)</h3>
                <p className="text-xs text-slate-500">Essa ferramenta permite simular de forma visual e matemática como o banco de dados se comporta em requisições de débito/crédito concorrentes simultâneas.</p>
              </div>
              <ConcurrencySimulator />
            </div>
          )}

          {activeViewTab === 'CODIGOS' && (
            <div id="view-codes" className="space-y-4">
              <div className="flex flex-col gap-1.5 mb-1">
                <h3 className="text-base font-bold text-slate-900">Navegador do Projeto Java Spring Boot</h3>
                <p className="text-xs text-slate-500">Inspecione de forma interativa a árvore de arquivos, pom e as classes Java com todas as regras de controle de estado e @Transactional declaradas.</p>
              </div>
              <CodeViewer />
            </div>
          )}

          {activeViewTab === 'MANUAIS' && (
            <div id="view-manuals" className="space-y-4">
              <div className="flex flex-col gap-1.5 mb-1">
                <h3 className="text-base font-bold text-slate-900">Manuais conceituais e guias de laboratório prático</h3>
                <p className="text-xs text-slate-500">Instruções completas para configurar o Apache JMeter, carregar coleções Postman inclusas, e auditar os saldos das tabelas pelo console H2.</p>
              </div>
              <GuidesAndInstructions />
            </div>
          )}
        </div>

      </main>

      {/* Presentation Footer */}
      <footer id="app-footer-wrapper" className="bg-slate-900 text-slate-400 py-8 border-t border-slate-855 text-xs text-center select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex justify-center items-center gap-6 font-semibold">
            <span className="text-slate-300 font-bold uppercase tracking-wider">Java Spring Boot 3</span>
            <span className="h-3 w-px bg-slate-800"></span>
            <span className="text-slate-300 font-bold uppercase tracking-wider">JPA / Hibernate @Version</span>
            <span className="h-3 w-px bg-slate-800"></span>
            <span className="text-slate-300 font-bold uppercase tracking-wider">H2 DB</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Este trabalho prático foi estruturado seguindo rigorosamente os preceitos de consistência de bancos de dados ACID (Atomicidade, Consistência, Isolamento, Durabilidade).
          </p>
          <div className="text-[9px] text-slate-600">
            © 2026 Trabalho Acadêmico de Concorrência e Consistência. Desenvolvido para apresentação interativa.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
