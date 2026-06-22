package com.trabalho.concorrencia.service;

import com.trabalho.concorrencia.entity.ContaBancaria;
import com.trabalho.concorrencia.exception.SaldoInsuficienteException;
import com.trabalho.concorrencia.repository.ContaBancariaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ContaBancariaService {

    private final ContaBancariaRepository repository;

    @Autowired
    public ContaBancariaService(ContaBancariaRepository repository) {
        this.repository = repository;
    }

    public List<ContaBancaria> listarTodas() {
        return repository.findAll();
    }

    public ContaBancaria buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Conta bancária não encontrada com o ID: " + id));
    }

    @Transactional
    public ContaBancaria deposito(Long id, BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor do depósito deve ser maior que zero.");
        }
        
        ContaBancaria conta = buscarPorId(id);
        
        // Simulação de delay para teste acadêmico de concorrência (opcional se quiser forçar lost update mais facilmente)
        try {
            Thread.sleep(50); // Pequeno delay de 50ms para evidenciar a sobreposição física das threads
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        BigDecimal novoSaldo = conta.getSaldo().add(valor);
        conta.setSaldo(novoSaldo);
        
        return repository.save(conta);
    }

    @Transactional
    public ContaBancaria saque(Long id, BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor do saque deve ser maior que zero.");
        }
        
        ContaBancaria conta = buscarPorId(id);
        
        // Simulação de delay
        try {
            Thread.sleep(50);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        if (conta.getSaldo().compareTo(valor) < 0) {
            throw new SaldoInsuficienteException("Saldo insuficiente para realizar o saque. Saldo atual: R$ " + conta.getSaldo());
        }

        BigDecimal novoSaldo = conta.getSaldo().subtract(valor);
        conta.setSaldo(novoSaldo);
        
        return repository.save(conta);
    }
}
