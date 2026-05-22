import { RowDataPacket } from "mysql2";

export interface iMovimentacaoEstoque extends RowDataPacket {
  idMovimentacao?: number;
  idProduto: number;
  tipo: "ENTRADA" | "SAIDA" | "AJUSTE";
  quantidade: number;
  dataMovimentacao?: Date;
}

export class MovimentacaoEstoque {
  private _id?: number;
  private _idProduto!: number;
  private _tipo!: string;
  private _quantidade!: number;

  constructor(idProduto: number, tipo: string, quantidade: number, id?: number) {
    this._idProduto = idProduto;
    this.Tipo = tipo;
    this.Quantidade = quantidade;
    this._id = id;
  }

  get Id() { return this._id; }
  get IdProduto() { return this._idProduto; }
  get Tipo() { return this._tipo; }
  get Quantidade() { return this._quantidade; }

  set Tipo(value: string) {
    const tiposValidos = ["ENTRADA", "SAIDA", "AJUSTE"];
    if (!tiposValidos.includes(value)) {
      throw new Error("Tipo inválido");
    }
    this._tipo = value;
  }

  set Quantidade(value: number) {
    if (value <= 0) {
      throw new Error("Quantidade deve ser maior que zero");
    }
    this._quantidade = value;
  }
}