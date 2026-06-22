package com.trabalho.concorrencia.service;

import com.trabalho.concorrencia.entity.ContaBancariaVersionada;
import com.trabalho.concorrencia.exception.SaldoInsuficienteException;
import com.trabalho.concorrencia.repository.ContaBancariaVersionadaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ContaBancariaVersionadaService {

    private final ContaBancariaVersionadaRepository repository;

    @Autowired
    public ContaBancariaVersionadaService(ContaBancariaVersionadaRepository repository) {
        this.repository = repository;
    }

    public List<ContaBancariaVersionada> listarTodas() {
        return repository.findAll();
    }

    public ContaBancariaVersionada buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Conta versionada não encontrada com o ID: " + id));
    }

    @Transactional
    public ContaBancariaVersionada deposito(Long id, BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor do depósito deve ser maior que zero.");
        }
        
        ContaBancariaVersionada conta = buscarPorId(id);
        
        // Simulação de delay para teste acadêmico de concorrência
        try {
            Thread.sleep(50); // Este delay garante que transações concorrentes leiam o mesmo 'version' e o conflito ocorra no commit
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        BigDecimal novoSaldo = conta.getSaldo().add(valor);
        conta.setSaldo(novoSaldo);
        
        return repository.save(conta);
    }

    @Transactional
    public ContaBancariaVersionada saque(Long id, BigDecimal valor) {
        if (valor == null || valor.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("O valor do saque deve ser maior que zero.");
        }
        
        ContaBancariaVersionada conta = buscarPorId(id);
        
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
