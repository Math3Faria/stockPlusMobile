import { RowDataPacket } from "mysql2";

export interface IEstoque extends RowDataPacket {
    idEstoque?: number;
    idProduto?: number;
    qtdAtual?: number;
    qtdMinima?: number;
    qtdMaxima?: number;
}

export class Estoque {
    private _idEstoque?: number;
    private _idProduto: number;
    private _qtdAtual: number;
    private _qtdMinima: number;
    private _qtdMaxima: number;

    constructor(
        idProduto: number,
        qtdAtual: number,
        qtdMinima: number,
        qtdMaxima: number,
        idEstoque?: number
    ) {
        this._idProduto = idProduto;
        this._qtdAtual = qtdAtual;
        this._qtdMinima = qtdMinima;
        this._qtdMaxima = qtdMaxima;
        this._idEstoque = idEstoque;
    }

    public static criar(
        idProduto: number,
        qtdAtual: number,
        qtdMinima: number,
        qtdMaxima: number
    ): Estoque {
        return new Estoque(idProduto, qtdAtual, qtdMinima, qtdMaxima);
    }

    public static editar(
        idEstoque: number,
        idProduto: number,
        qtdAtual: number,
        qtdMinima: number,
        qtdMaxima: number
    ): Estoque {
        return new Estoque(
            idProduto,
            qtdAtual,
            qtdMinima,
            qtdMaxima,
            idEstoque
        );
    }

    // Getters
    public get idProduto(): number {
        return this._idProduto;
    }

    public get qtdAtual(): number {
        return this._qtdAtual;
    }

    public get qtdMinima(): number {
        return this._qtdMinima;
    }

    public get qtdMaxima(): number {
        return this._qtdMaxima;
    }
}