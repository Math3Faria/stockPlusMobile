import { RowDataPacket } from "mysql2";

export interface iCategoria extends RowDataPacket {
    id_categoria?: number;
    descricao?: string;
}

export class Categoria {
    private _id_categoria?: number;
    private _descricao: string = '';

    constructor(
        descricao: string,
        id?: number
    ) {
        this.Descricao = descricao;
        this._id_categoria = id;
    }

    // Getters
    public get Id(): number | undefined {
        return this._id_categoria;
    }

    public get Descricao(): string {
        return this._descricao;
    }

    // Setters
    public set Descricao(value: string) {
        this._validarDescricao(value);
        this._descricao = value;
    }

    // Factory
    public static criar(
        descricao: string
    ): Categoria {
        return new Categoria(descricao);
    }

    public static editar(
        descricao: string,
        id: number,
    ): Categoria {
        return new Categoria(descricao, id);
    }

    private _validarDescricao(value: string): void {
        if (!value || value.trim().length < 3) {
            throw new Error("Descrição da categoria deve ter pelo menos 3 caracteres");
        }

        if (value.trim().length > 100) {
            throw new Error("Descrição da categoria deve ter no máximo 100 caracteres");
        }
    }
}