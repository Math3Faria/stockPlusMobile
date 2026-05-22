import { RowDataPacket } from "mysql2";

export interface iFornecedor extends RowDataPacket {
    idFornecedor?: number;
    empresa?: string;
    email?: string;
    cnpj?: string;
}

export class Fornecedor {
    private _idFornecedor?: number;
    private _empresa: string = '';
    private _email: string = '';
    private _cnpj: string = '';

    constructor(
        empresa: string,
        email: string,
        cnpj: string,
        id?: number
    ) {
        this.Empresa = empresa;
        this.Email = email;
        this.Cnpj = cnpj;
        this._idFornecedor = id;
    }

    // Getters
    public get Id(): number | undefined {
        return this._idFornecedor;
    }

    public get Empresa(): string {
        return this._empresa;
    }

    public get Email(): string {
        return this._email;
    }

    public get Cnpj(): string {
        return this._cnpj;
    }

    // Setters
    public set Empresa(value: string) {
        this._validarEmpresa(value);
        this._empresa = value;
    }

    public set Email(value: string) {
        this._email = value;
    }

    public set Cnpj(value: string) {
        this._validarCnpj(value);
        this._cnpj = value;
    }

    // Factory
    public static criar(
        empresa: string,
        email: string,
        cnpj: string
    ): Fornecedor {
        return new Fornecedor(empresa, email, cnpj);
    }

    public static editar(
        empresa: string,
        email: string,
        cnpj: string,
        id: number
    ): Fornecedor {
        return new Fornecedor(empresa, email, cnpj, id);
    }

    private _validarEmpresa(value: string): void {
        if (!value || value.trim().length < 3) {
            throw new Error("Nome da empresa deve ter pelo menos 3 caracteres");
        }

        if (value.trim().length > 80) {
            throw new Error("Nome da empresa deve ter no máximo 80 caracteres");
        }
    }

    private _validarCnpj(value: string): void {
        if (!value || value.trim().length < 3) {
            throw new Error("CNPJ deve ter 14 caracteres");
        }
    }
}