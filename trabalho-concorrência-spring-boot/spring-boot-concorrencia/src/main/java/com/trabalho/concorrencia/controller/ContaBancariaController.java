package com.trabalho.concorrencia.controller;

import com.trabalho.concorrencia.dto.MovimentacaoDTO;
import com.trabalho.concorrencia.entity.ContaBancaria;
import com.trabalho.concorrencia.service.ContaBancariaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contas")
@CrossOrigin(origins = "*")
public class ContaBancariaController {

    private final ContaBancariaService service;

    @Autowired
    public ContaBancariaController(ContaBancariaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ContaBancaria>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContaBancaria> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping("/{id}/deposito")
    public ResponseEntity<ContaBancaria> deposito(@PathVariable Long id, @RequestBody MovimentacaoDTO dto) {
        ContaBancaria contaAtualizada = service.deposito(id, dto.getValor());
        return ResponseEntity.ok(contaAtualizada);
    }

    @PostMapping("/{id}/saque")
    public ResponseEntity<ContaBancaria> saque(@PathVariable Long id, @RequestBody MovimentacaoDTO dto) {
        ContaBancaria contaAtualizada = service.saque(id, dto.getValor());
        return ResponseEntity.ok(contaAtualizada);
    }
}
