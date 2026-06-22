# Trabalho Acadêmico: Concorrência e Consistência em Banco de Dados com Spring Boot 3

Este repositório contém o projeto de software completo e a respectiva documentação conceitual para o trabalho prático sobre concorrência e consistência de dados. O projeto demonstra na prática os problemas da falta de mecanismos de isolamento concorrente (com o fenômeno **Lost Update**) e a respectiva resolução utilizando **Controle de Concorrência Otimista (Optimistic Locking)** via Hibernate/JPA no ecossistema Spring Boot 3.

---

## 🎯 Objetivo do Trabalho

O objetivo principal é avaliar a consistência dos dados em cenários transacionais altamente concorrentes, analisando:
1. **Comportamento Sem Controle de Concorrência:** O impacto das condições de corrida de múltiplas threads atualizando o mesmo registro concorrentemente. Demonstração prática do problema de **Lost Update** (Atualização Perdida).
2. **Comportamento Com Controle Otimista:** A resolução do problema de concorrência com o uso da anotação `@Version` do JPA, tratando de forma elegante as exceções geradas e retornando respostas semânticas para a camada cliente.

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** Java 17
* **Framework Principal:** Spring Boot 3.2.4
* **Acesso a Dados:** Spring Data JPA / Hibernate
* **Banco de Dados:** Banco H2 (Em Memória)
* **Gerenciador de Dependências:** Maven
* **Ferramentas de Testes de Carga:** Apache JMeter e Postman

---

## 📂 Estrutura Completa de Arquivos do Projeto Java

Abaixo encontra-se a arquitetura e árvore de diretórios do projeto principal:

```text
spring-boot-concorrencia/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/
        │       └── trabalho/
        │           └── concorrencia/
        │               ├── ConcorrenciaApplication.java
        │               ├── config/
        │               │   └── DataLoader.java
        │               ├── controller/
        │               │   ├── ContaBancariaController.java
        │               │   └── ContaBancariaVersionadaController.java
        │               ├── dto/
        │               │   └── MovimentacaoDTO.java
        │               ├── entity/
        │               │   ├── ContaBancaria.java
        │               │   └── ContaBancariaVersionada.java
        │               ├── exception/
        │               │   ├── GlobalExceptionHandler.java
        │               │   └── SaldoInsuficienteException.java
        │               ├── repository/
        │               │   ├── ContaBancariaRepository.java
        │               │   └── ContaBancariaVersionadaRepository.java
        │               └── service/
        │                   ├── ContaBancariaService.java
        │                   └── ContaBancariaVersionadaService.java
        └── resources/
            └── application.properties
```

---

## 🚀 Como Executar o Back-end Spring Boot

### Pré-requisitos
* Possuir o **JDK 17** instalado na máquina.
* Ter o **Apache Maven** instalado (ou utilizar o wrapper `./mvnw` incluído no diretório principal).

### Passos para Inicialização
1. Abra um terminal na pasta do projeto `/spring-boot-concorrencia`.
2. Compile e instale as dependências executando:
   ```bash
   mvn clean install
   ```
3. Inicie o servidor da aplicação Spring Boot:
   ```bash
   mvn spring-boot:run
   ```
4. O servidor inicializará com sucesso escutando na porta **8080** (`http://localhost:8080`).

---

## 🗄️ Acesso ao Console do Banco H2

Como o banco H2 roda em memória, as modificações são evaporadas a cada reinício de container. O console web está habilitado por padrão para possibilitar monitoramento em tempo real:

* **URL de Acesso:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
* **JDBC URL:** `jdbc:h2:mem:dbconcorrencia`
* **Driver Class:** `org.h2.Driver`
* **User Name:** `sa`
* **Password:** *(deixe em branco/vazio)*

Com essa conexão, você consegue projetar tabelas e rodar queries como:
```sql
SELECT * FROM CONTA_BANCARIA;
SELECT * FROM CONTA_BANCARIA_VERSIONADA;
```

---

## 🛸 Como Rodar Testes Pelo Postman

Foi disponibilizada uma collection pronta no diretório do projeto em `/test-artifacts/concorrencia_postman_collection.json`. 

1. Abra o Postman.
2. No canto superior esquerdo, clique em **Import**.
3. Selecione o arquivo `concorrencia_postman_collection.json` e confirme.
4. Você terá uma pasta com todas as requisições configuradas para listar, buscar e depositar em ambas as tabelas comuns e versionadas.

### Exemplo de Requisição (Depósito)
* **URL:** `POST http://localhost:8080/contas-versionadas/1/deposito`
* **Headers:** `Content-Type: application/json`
* **Body (raw JSON):**
  ```json
  {
    "valor": 100.00
  }
  ```

---

## ⚡ Como Executar os Testes de Concorrência no JMeter

Um plano de testes de carga extremamente maduro foi gerado de forma declarativa e está salvo no diretório `/test-artifacts/concorrencia_jmeter_test_plan.jmx`.

### Cenário 1: 50 Threads, 10 Loops executando Depósitos Simultâneos na Conta Comum
O arquivo de teste simula 50 threads ativas com 10 repetições de loop cada (totalizando **500 requisições simultâneas**). Cada transação acrescenta R$ 10,00 adicionais na conta.

1. Abra o **Apache JMeter**.
2. Vá em `File > Open` e carregue o arquivo de teste `concorrencia_jmeter_test_plan.jmx`.
3. Verifique que o grupo de threads já vem mapeado com `Number of Threads = 50` e `Loop Count = 10`.
4. Deixe o sampler `POST Deposito - Sem @Version` habilitado e limpe os dados de histórico.
5. Inicie clicando no botão **Start (ícone do Play verde)**.
   * *Resultado esperado:* O JMeter apresentará 100% de sucesso nas transações (HTTP Status 200 OK na Árvore de Resultados). No entanto, ao emitir um SELECT no console H2, o saldo de João estará muito aquém de R$ 6000,00 (os R$ 1000,00 iniciais + R$ 5000,00 depositados pelas threads concorrentes), variando em torno de apenas R$ 1010,00 ou R$ 1020,00. **Condição de Lost Update gerada e documentada!**

### Cenário 2: Executando com Controle de Concorrência Otimista
1. No JMeter, desabilite o sampler sem versão (botão direito > Disable) e ative o selector `POST Deposito - Com @Version (Otimista)` (botão direito > Enable).
2. Execute o plano novamente pressionando o Play.
   * *Resultado esperado:* Você visualizará múltiplos erros representados por círculos vermelhos com o código **409 Conflict** na Árvore de Resultados do JMeter. Essas requisições foram rejeitadas por conflitos de concorrência com o disparo de `ObjectOptimisticLockingFailureException` e capturadas pelo `GlobalExceptionHandler`.
   * *Garantia de consistência:* Verifique no H2 que o saldo de Maria foi acrescido apenas para os commits que de fato casaram com as versões no banco. Nenhuma transação incorreta atualizou por cima de outra sem notificação técnica.

---

## 📑 Explicação Detalhada das Parte 1 e Parte 2

### Parte 1 - Sem Controle de Concorrência
Na primeira abordagem, as transações são normais e utilizam apenas a anotação `@Transactional` padrão do módulo Spring. Sem nenhum bloqueio ou checagem de concorrência ativa:
1. Thread-A e Thread-B acessam o banco sob a mesma referência de tempo e leem que o saldo atual de João é **R$ 1000,00**.
2. Thread-A processa o depósito de R$ 10,00 e calcula localmente na JVM que o novo saldo é **R$ 1010,00**.
3. Anted de Thread-A sincronizar no banco, Thread-B realiza o seu processamento também calculando **R$ 1010,00**.
4. Thread-A persiste seu valor no banco substituindo com R$ 1010,00.
5. Logo na sequência, Thread-B executa o seu commit alterando o saldo para R$ 1010,00 também.
6. **Conclusão:** O depósito de R$ 10,00 feito pela Thread-A foi totalmente perdido de forma silenciosa no que se conhece classicamente como o fenômeno de **Lost Update** na teoria dos Bancos de Dados Relacionais.

### Parte 2 - Controle de Versão Otimista
Com a concorrência otimista implementada através do campo `Integer version` acompanhado pela anotação de ciclo `@Version`:
1. Toda vez que uma requisição carrega uma entidade mapeada, ela recupera também sua "versão de rastreio" persistida (ex: `version = 0`).
2. No momento em que uma transação envia seu comando de atualização ao banco, o Hibernate injeta no motor SQL uma proteção contendo a versão capturada no momento da consulta inicial:
   ```sql
   UPDATE conta_bancaria_versionada SET saldo = ?, version = 1 WHERE id = 1 AND version = 0;
   ```
3. Se o thread concorrente chegou antes e atualizou o registro, o campo de versão na tabela mudará para `1`. O UPDATE subsequente da Thread-B tentará encontrar uma linha cujo critério filtre por `version = 0`. Como não encontra (0 linhas atualizadas), o Hibernate detecta a sobreposição concorrente e lança **ObjectOptimisticLockingFailureException**.
4. O `GlobalExceptionHandler` intercepta essa exceção e envia uma resposta HTTP **409 Conflict** limpa para o usuário.

---

## 📊 Tabela Comparativa das Abordagens

| Critério de Comparação | Sem Controle de Concorrência (Parte 1) | Controle de Versão Otimista (Parte 2) |
| :--- | :--- | :--- |
| **Integridade dos Dados** | Crítica (Sujeito a perdas silenciosas de saldos) | 100% Protegida (Evita sobresscritas mútuas via `@Version`) |
| **Erro de Requisição** | Zero erros de infraestrutura (Silenciosamente inconsistente) | Retorna **409 Conflict** informando o conflito com exatidão |
| **Overhead de Performance** | Quase nulo, pois não faz validações de concorrência | Extremamente leve (apenas comparação rápida do dígito de versão) |
| **Mecanismo de Retentativa** | Não aplicável (os dados simplesmente são gravados errados) | Recomendado aplicar lógica de retry na camada de aplicação |
| **Bloqueio de Tabelas** | Nenhum | Nenhum (Ideal para leitura intensiva sem travamento físico de linhas) |
