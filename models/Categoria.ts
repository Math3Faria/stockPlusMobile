export class Categoria {
    private id: number = 0;
    private nome: string = "";


    constructor(pNome: string, pId: number) {
        this.Nome= pNome;
        this.Id = pId;
    }

    // Getters
    get Id():number {
        return this.id;
    }
    get Nome() {
        return this.nome;
    }

    //Setters

    set Id(value:number) {
        this.validarId(value);
        this.id=value;
    }
    set Nome(value:string) {
        this.validarNome(value);
        this.nome = value.trim();
    }

    //validação
    private validarId(value: number): boolean {
        if (value < 0)
            throw new Error('Verifique o ID informado')
        return true;
    }

    private validarNome(value:string):boolean {
        if(!value || value.trim().length < 4)
            throw new Error ('Verifique o nome informado e tente novamente');
        return true
    }
}