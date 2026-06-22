# Trabalho Acadêmico: Concorrência e Consistência em Banco de Dados com Spring Boot 3

Este diretório contém o projeto de software em Java Spring Boot 3 completo para o seu trabalho prático sobre concorrência e consistência de dados.

---

## 🛠️ Tecnologias Utilizadas
* **Linguagem:** Java 17
* **Framework Principal:** Spring Boot 3.2.4
* **Acesso a Dados:** Spring Data JPA / Hibernate
* **Banco de Dados:** Banco H2 (Em Memória)
* **Gerenciador de Dependências:** Maven
* **Ferramentas de Testes de Carga:** Apache JMeter e Postman

---

## 📂 Estrutura de Arquivos
```text
.
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

### Passo a Passo
1. No terminal, compile e instale as dependências:
   ```bash
   mvn clean install
   ```
2. Inicie o servidor da aplicação:
   ```bash
   mvn spring-boot:run
   ```
3. O servidor rodará em `http://localhost:8080`.

---

## 🗄️ Acesso ao Console do Banco H2
* **URL de Acesso:** [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
* **JDBC URL:** `jdbc:h2:mem:dbconcorrencia`
* **Driver Class:** `org.h2.Driver`
* **User Name:** `sa`
* **Password:** *(deixe em branco)*

---

## ⚡ Testes de Concorrência e Carga

As pastas `./test-artifacts` ou as coleções inclusas fornecem suporte imediato para rodar no **Postman** e **Apache JMeter**.

### Mapeamentos dos Endpoints Disponibilizados

#### Sem Controle de Concorrência (Parte 1)
* **POST** `http://localhost:8080/contas/1/deposito` - Efetua depósito com saldo e transações normais (sujeito a *Lost Update*).
* **POST** `http://localhost:8080/contas/1/saque` - Efetua saque com saldo e transações normais.

#### Com Versão Otimista (Parte 2)
* **POST** `http://localhost:8080/contas-versionadas/1/deposito` - Efetua depósito com verificação automática `@Version` (triggers lock exceptions).
* **POST** `http://localhost:8080/contas-versionadas/1/saque` - Efetua saque versionado.
