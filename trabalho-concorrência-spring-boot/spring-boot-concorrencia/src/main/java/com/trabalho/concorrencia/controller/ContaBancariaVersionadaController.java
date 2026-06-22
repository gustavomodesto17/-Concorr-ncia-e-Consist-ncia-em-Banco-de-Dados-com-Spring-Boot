package com.trabalho.concorrencia.controller;

import com.trabalho.concorrencia.dto.MovimentacaoDTO;
import com.trabalho.concorrencia.entity.ContaBancariaVersionada;
import com.trabalho.concorrencia.service.ContaBancariaVersionadaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contas-versionadas")
@CrossOrigin(origins = "*")
public class ContaBancariaVersionadaController {

    private final ContaBancariaVersionadaService service;

    @Autowired
    public ContaBancariaVersionadaController(ContaBancariaVersionadaService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<ContaBancariaVersionada>> listarTodas() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContaBancariaVersionada> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping("/{id}/deposito")
    public ResponseEntity<ContaBancariaVersionada> deposito(@PathVariable Long id, @RequestBody MovimentacaoDTO dto) {
        ContaBancariaVersionada contaAtualizada = service.deposito(id, dto.getValor());
        return ResponseEntity.ok(contaAtualizada);
    }

    @PostMapping("/{id}/saque")
    public ResponseEntity<ContaBancariaVersionada> saque(@PathVariable Long id, @RequestBody MovimentacaoDTO dto) {
        ContaBancariaVersionada contaAtualizada = service.saque(id, dto.getValor());
        return ResponseEntity.ok(contaAtualizada);
    }
}
