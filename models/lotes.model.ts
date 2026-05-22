import { RowDataPacket } from "mysql2";

export interface ILote extends RowDataPacket {
    idLote?: number;
    idProduto?: number;
    quantidadeEntrada?: number;
    dataValidade?: Date;
    dataEntrada?: Date;
}

export class Lote {
    private _idLote?: number;
    private _idProduto: number;
    private _quantidadeEntrada: number;
    private _dataValidade: Date;
    private _dataEntrada?: Date;

    constructor(
        idProduto: number,
        quantidadeEntrada: number,
        dataValidade: Date,
        idLote?: number
    ) {
        this._idProduto = idProduto;
        this._quantidadeEntrada = quantidadeEntrada;
        this._dataValidade = dataValidade;
        this._idLote = idLote;
    }

    public static criar(
        idProduto: number,
        quantidadeEntrada: number,
        dataValidade: Date
    ): Lote {
        return new Lote(
            idProduto,
            quantidadeEntrada,
            dataValidade
        );
    }

    public static editar(
        idLote: number,
        idProduto: number,
        quantidadeEntrada: number,
        dataValidade: Date
    ): Lote {
        return new Lote(
            idProduto,
            quantidadeEntrada,
            dataValidade,
            idLote
        );
    }

    // Getters
    public get idLote(): number | undefined {
        return this._idLote;
    }

    public get idProduto(): number {
        return this._idProduto;
    }

    public get quantidadeEntrada(): number {
        return this._quantidadeEntrada;
    }

    public get dataValidade(): Date {
        return this._dataValidade;
    }

    public get dataEntrada(): Date | undefined {
        return this._dataEntrada;
    }
}