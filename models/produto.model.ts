import { RowDataPacket } from "mysql2";

export interface IProduto extends RowDataPacket {
    idProduto: number;
    nomeProduto: string;
    valor: number;
    idCategoria: number;
    idFornecedor: number;
    imagemProduto: string;
    dataCad: Date;
}

export interface IProdutoCreate {
    nomeProduto: string;
    valor: number;
    idCategoria: number;
    idFornecedor: number;
    imagemProduto: string;
}

export class Produto {
    private _idProduto?: number;
    private _nomeProduto: string;
    private _valor: number;
    private _idCategoria: number;
    private _idFornecedor: number;
    private _imagemProduto: string;

    constructor(
        nomeProduto: string,
        valor: number,
        idCategoria: number,
        idFornecedor: number,
        imagemProduto: string,
        idProduto?: number
    ) {
        this._validarNome(nomeProduto);

        if (valor <= 0) throw new Error("Valor deve ser maior que zero");

        this._nomeProduto = nomeProduto;
        this._valor = valor;
        this._idCategoria = idCategoria;
        this._idFornecedor = idFornecedor;
        this._imagemProduto = imagemProduto;
        this._idProduto = idProduto;
    }

    get idProduto() { return this._idProduto; }
    get nomeProduto() { return this._nomeProduto; }
    get valor() { return this._valor; }
    get idCategoria() { return this._idCategoria; }
    get idFornecedor() { return this._idFornecedor; }
    get imagemProduto() { return this._imagemProduto; }


    static criar(
        nomeProduto: string,
        valor: number,
        idCategoria: number,
        idFornecedor: number,
        imagemProduto: string
    ) {
        return new Produto(nomeProduto, valor, idCategoria, idFornecedor, imagemProduto);
    }

    static editar(
        idProduto: number,
        nomeProduto: string,
        valor: number,
        idCategoria: number,
        idFornecedor: number,
        imagemProduto: string
    ) {
        return new Produto(nomeProduto, valor, idCategoria, idFornecedor, imagemProduto, idProduto);
    }

    private _validarNome(nome: string) {
        if (!nome || nome.length < 3) {
            throw new Error("Nome deve ter pelo menos 3 caracteres");
        }
    }
}