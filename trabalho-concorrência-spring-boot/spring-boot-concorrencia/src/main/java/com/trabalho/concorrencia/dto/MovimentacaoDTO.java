package com.trabalho.concorrencia.dto;

import java.math.BigDecimal;

public class MovimentacaoDTO {

    private BigDecimal valor;

    // Construtores
    public MovimentacaoDTO() {
    }

    public MovimentacaoDTO(BigDecimal valor) {
        this.valor = valor;
    }

    // Getters e Setters
    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }
}
