import React, { useState } from 'react';

interface CodeFile {
  name: string;
  path: string;
  language: string;
  content: string;
}

const JAVA_PROJECT_FILES: CodeFile[] = [
  {
    name: "pom.xml",
    path: "pom.xml",
    language: "xml",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>

    <groupId>com.trabalho</groupId>
    <artifactId>concorrencia</artifactId>
    <version>1.0.0</version>
    <name>concorrencia</name>
    <description>Trabalho Prático - Concorrência e Consistência em Banco de Dados</description>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <!-- Spring Boot Starters -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Banco H2 (Em Memória) -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- DevTools -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>

        <!-- Dependência para testes -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    name: "application.properties",
    path: "src/main/resources/application.properties",
    language: "properties",
    content: `# Configuração do Nome do Aplicativo
spring.application.name=concorrencia

# Configuração da Conexão com o Banco de Dados H2
spring.datasource.url=jdbc:h2:mem:dbconcorrencia;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# Configurações do Hibernate/JPA
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Configuração do Console Web do H2
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
spring.h2.console.settings.web-allow-others=true

# Porta do Servidor (Padrão 8080)
server.port=8080`
  },
  {
    name: "ContaBancaria.java",
    path: "src/main/java/com/trabalho/concorrencia/entity/ContaBancaria.java",
    language: "java",
    content: `package com.trabalho.concorrencia.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "conta_bancaria")
public class ContaBancaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titular;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal saldo;

    public ContaBancaria() {}

    public ContaBancaria(Long id, String titular, BigDecimal saldo) {
        this.id = id;
        this.titular = titular;
        this.saldo = saldo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitular() { return titular; }
    public void setTitular(String titular) { this.titular = titular; }

    public BigDecimal getSaldo() { return saldo; }
    public void setSaldo(BigDecimal saldo) { this.saldo = saldo; }
}`
  },
  {
    name: "ContaBancariaVersionada.java",
    path: "src/main/java/com/trabalho/concorrencia/entity/ContaBancariaVersionada.java",
    language: "java",
    content: `package com.trabalho.concorrencia.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "conta_bancaria_versionada")
public class ContaBancariaVersionada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titular;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal saldo;

    @Version // Responsável pela concorrência otimista (Optimistic Locking)
    @Column(nullable = false)
    private Integer version;

    public ContaBancariaVersionada() {}

    public ContaBancariaVersionada(Long id, String titular, BigDecimal saldo) {
        this.id = id;
        this.titular = titular;
        this.saldo = saldo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitular() { return titular; }
    public void setTitular(String titular) { this.titular = titular; }

    public BigDecimal getSaldo() { return saldo; }
    public void setSaldo(BigDecimal saldo) { this.saldo = saldo; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}`
  },
  {
    name: "ContaBancariaService.java",
    path: "src/main/java/com/trabalho/concorrencia/service/ContaBancariaService.java",
    language: "java",
    content: `package com.trabalho.concorrencia.service;

import com.trabalho.concorrencia.entity.ContaBancaria;
import com.trabalho.concorrencia.exception.SaldoInsuficienteException;
import com.trabalho.concorrencia.repository.ContaBancariaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class ContaBancariaService {

    private final ContaBancariaRepository repository;

    @Autowired
    public ContaBancariaService(ContaBancariaRepository repository) {
        this.repository = repository;
    }

    public ContaBancaria buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Conta não encontrada. ID: " + id));
    }

    @Transactional
    public ContaBancaria deposito(Long id, BigDecimal valor) {
        ContaBancaria conta = buscarPorId(id);
        
        // Simulação de pequeno delay de processamento (para visualização acadêmica)
        try { Thread.sleep(50); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

        conta.setSaldo(conta.getSaldo().add(valor));
        return repository.save(conta);
    }

    @Transactional
    public ContaBancaria saque(Long id, BigDecimal valor) {
        ContaBancaria conta = buscarPorId(id);
        
        try { Thread.sleep(50); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

        if (conta.getSaldo().compareTo(valor) < 0) {
            throw new SaldoInsuficienteException("Saldo insuficiente!");
        }

        conta.setSaldo(conta.getSaldo().subtract(valor));
        return repository.save(conta);
    }
}`
  },
  {
    name: "ContaBancariaVersionadaService.java",
    path: "src/main/java/com/trabalho/concorrencia/service/ContaBancariaVersionadaService.java",
    language: "java",
    content: `package com.trabalho.concorrencia.service;

import com.trabalho.concorrencia.entity.ContaBancariaVersionada;
import com.trabalho.concorrencia.exception.SaldoInsuficienteException;
import com.trabalho.concorrencia.repository.ContaBancariaVersionadaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

@Service
public class ContaBancariaVersionadaService {

    private final ContaBancariaVersionadaRepository repository;

    @Autowired
    public ContaBancariaVersionadaService(ContaBancariaVersionadaRepository repository) {
        this.repository = repository;
    }

    public ContaBancariaVersionada buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Conta versionada não encontrada. ID: " + id));
    }

    @Transactional
    public ContaBancariaVersionada deposito(Long id, BigDecimal valor) {
        ContaBancariaVersionada conta = buscarPorId(id);
        
        // Pequena pausa para garantir concorrência no commit
        try { Thread.sleep(50); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

        conta.setSaldo(conta.getSaldo().add(valor));
        return repository.save(conta); // Lança ObjectOptimisticLockingFailureException se a versão mudar no DB
    }

    @Transactional
    public ContaBancariaVersionada saque(Long id, BigDecimal valor) {
        ContaBancariaVersionada conta = buscarPorId(id);
        
        try { Thread.sleep(50); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }

        if (conta.getSaldo().compareTo(valor) < 0) {
            throw new SaldoInsuficienteException("Saldo insuficiente.");
        }

        conta.setSaldo(conta.getSaldo().subtract(valor));
        return repository.save(conta);
    }
}`
  },
  {
    name: "ContaBancariaController.java",
    path: "src/main/java/com/trabalho/concorrencia/controller/ContaBancariaController.java",
    language: "java",
    content: `package com.trabalho.concorrencia.controller;

import com.trabalho.concorrencia.dto.MovimentacaoDTO;
import com.trabalho.concorrencia.entity.ContaBancaria;
import com.trabalho.concorrencia.service.ContaBancariaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/contas")
@CrossOrigin(origins = "*")
public class ContaBancariaController {

    @Autowired
    private ContaBancariaService service;

    @PostMapping("/{id}/deposito")
    public ResponseEntity<ContaBancaria> deposito(@PathVariable Long id, @RequestBody MovimentacaoDTO dto) {
        return ResponseEntity.ok(service.deposito(id, dto.getValor()));
    }

    @PostMapping("/{id}/saque")
    public ResponseEntity<ContaBancaria> saque(@PathVariable Long id, @RequestBody MovimentacaoDTO dto) {
        return ResponseEntity.ok(service.saque(id, dto.getValor()));
    }
}`
  },
  {
    name: "GlobalExceptionHandler.java",
    path: "src/main/java/com/trabalho/concorrencia/exception/GlobalExceptionHandler.java",
    language: "java",
    content: `package com.trabalho.concorrencia.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(SaldoInsuficienteException.class)
    public ResponseEntity<Object> handleSaldoInsuficiente(SaldoInsuficienteException ex, HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        body.put("path", request.getRequestURI());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<Object> handleOptimisticLock(ObjectOptimisticLockingFailureException ex, HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Conflict");
        body.put("message", "Falha de concorrência: O registro foi atualizado por outro processo simultâneo.");
        body.put("path", request.getRequestURI());
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Object> handleNotFound(EntityNotFoundException ex, HttpServletRequest request) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        body.put("path", request.getRequestURI());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }
}`
  },
  {
    name: "DataLoader.java",
    path: "src/main/java/com/trabalho/concorrencia/config/DataLoader.java",
    language: "java",
    content: `package com.trabalho.concorrencia.config;

import com.trabalho.concorrencia.entity.ContaBancaria;
import com.trabalho.concorrencia.entity.ContaBancariaVersionada;
import com.trabalho.concorrencia.repository.ContaBancariaRepository;
import com.trabalho.concorrencia.repository.ContaBancariaVersionadaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class DataLoader implements CommandLineRunner {

    private final ContaBancariaRepository contaRepo;
    private final ContaBancariaVersionadaRepository contaVersionadaRepo;

    public DataLoader(ContaBancariaRepository c, ContaBancariaVersionadaRepository cv) {
        this.contaRepo = c;
        this.contaVersionadaRepo = cv;
    }

    @Override
    public void run(String... args) throws Exception {
        // João - sem @Version
        if (contaRepo.count() == 0) {
            contaRepo.save(new ContaBancaria(1L, "João", new BigDecimal("1000.00")));
        }
        // Maria - com @Version
        if (contaVersionadaRepo.count() == 0) {
            contaVersionadaRepo.save(new ContaBancariaVersionada(1L, "Maria", new BigDecimal("1000.00")));
        }
    }
}`
  }
];

export const CodeViewer: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentFile = JAVA_PROJECT_FILES[selectedFileIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="code-viewer-container" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* File List / Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto scrollbar-hide">
        {JAVA_PROJECT_FILES.map((file, idx) => (
          <button
            key={file.name}
            id={`tab-file-${idx}`}
            onClick={() => setSelectedFileIndex(idx)}
            className={`px-4 py-3 text-xs font-mono whitespace-nowrap transition-all duration-200 border-b-2 font-medium ${
              selectedFileIndex === idx
                ? 'border-emerald-500 text-emerald-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            📄 {file.name}
          </button>
        ))}
      </div>

      {/* Code Header bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-[11px] text-slate-400">
        <span className="font-mono text-slate-500">{currentFile.path}</span>
        <button
          id="btn-copy-code"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition duration-200 font-medium active:scale-95"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copiado!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2_1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copiar Código</span>
            </>
          )}
        </button>
      </div>

      {/* Code Area */}
      <div className="p-4 bg-slate-950/40 text-slate-100 font-mono text-xs leading-relaxed max-h-[500px] overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-800">
        <pre id="code-block" className="outline-none">
          <code>
            {currentFile.content.split('\n').map((line, index) => {
              // Simple simulation of token scanning for visual contrast
              let lineColored = line;
              const isComment = line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*');
              const isAnnotation = line.trim().startsWith('@');
              const isImportOrPackage = line.trim().startsWith('import ') || line.trim().startsWith('package ');

              if (isComment) {
                return (
                  <div key={index} id={`line-${index+1}`} className="text-slate-500 italic">
                    <span className="inline-block w-8 text-slate-700 select-none text-[10px] pr-2 text-right">
                      {index + 1}
                    </span>
                    {line}
                  </div>
                );
              } else if (isAnnotation) {
                return (
                  <div key={index} id={`line-${index+1}`}>
                    <span className="inline-block w-8 text-slate-700 select-none text-[10px] pr-2 text-right">
                      {index + 1}
                    </span>
                    <span className="text-amber-400 font-semibold">{line}</span>
                  </div>
                );
              } else if (isImportOrPackage) {
                return (
                  <div key={index} id={`line-${index+1}`}>
                    <span className="inline-block w-8 text-slate-700 select-none text-[10px] pr-2 text-right">
                      {index + 1}
                    </span>
                    <span className="text-slate-400">{line}</span>
                  </div>
                );
              }

              return (
                <div key={index} id={`line-${index+1}`} className="hover:bg-slate-900/30">
                  <span className="inline-block w-8 text-slate-700 select-none text-[10px] pr-2 text-right">
                    {index + 1}
                  </span>
                  <span>{line}</span>
                </div>
              );
            })}
          </code>
        </pre>
      </div>
    </div>
  );
};
