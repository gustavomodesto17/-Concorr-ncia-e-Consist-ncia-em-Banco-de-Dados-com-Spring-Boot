package com.trabalho.concorrencia.config;

import com.trabalho.concorrencia.entity.ContaBancaria;
import com.trabalho.concorrencia.entity.ContaBancariaVersionada;
import com.trabalho.concorrencia.repository.ContaBancariaRepository;
import com.trabalho.concorrencia.repository.ContaBancariaVersionadaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataLoader implements CommandLineRunner {

    private final ContaBancariaRepository contaRepository;
    private final ContaBancariaVersionadaRepository contaVersionadaRepository;

    @Autowired
    public DataLoader(ContaBancariaRepository contaRepository, 
                      ContaBancariaVersionadaRepository contaVersionadaRepository) {
        this.contaRepository = contaRepository;
        this.contaVersionadaRepository = contaVersionadaRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        // Inicialização da ContaBancaria (Sem controle de concorrência)
        if (contaRepository.count() == 0) {
            ContaBancaria contaComum = new ContaBancaria();
            contaComum.setId(1L);
            contaComum.setTitular("João");
            contaComum.setSaldo(new BigDecimal("1000.00"));
            contaRepository.save(contaComum);
            System.out.println(">>> ContaBancaria de João (ID: 1, Saldo: R$ 1000.00) cadastrada com sucesso!");
        }

        // Inicialização da ContaBancariaVersionada (Com controle otimista de concorrência)
        if (contaVersionadaRepository.count() == 0) {
            ContaBancariaVersionada contaVersionada = new ContaBancariaVersionada();
            contaVersionada.setId(1L);
            contaVersionada.setTitular("Maria");
            contaVersionada.setSaldo(new BigDecimal("1000.00"));
            // O version é controlado automaticamente pelo Hibernate, inicializa em 0
            contaVersionadaRepository.save(contaVersionada);
            System.out.println(">>> ContaBancariaVersionada de Maria (ID: 1, Saldo: R$ 1000.00) cadastrada com sucesso!");
        }
    }
}
