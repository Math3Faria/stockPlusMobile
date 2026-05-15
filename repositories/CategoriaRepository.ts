import { getDb } from "../database/database";
import { Categoria } from "../models/Categoria";
import * as SQLite from 'expo-sqlite'

export class CategoriaRepository {
    async create(categoria: Categoria): Promise<void> {
        try {
            const db = await getDb();
            db.runAsync(
                'INSERT INTO Categorias (nome) VALUES (?)',
                [categoria.Nome]
            );
        } catch (error) {
            console.error('Error insert', error)
        }
    }

    async findAll(): Promise<Categoria[]> {
        try {
            const db = await getDb();
            const result = db.getAllAsync<Categoria>('SELECT * FROM Categorias');
            return result;
        } catch (error) {
            console.error('Erro insert', error);
            throw new Error('Erro ao buscar categorias');
        }
    }

    async delete(id: number): Promise<SQLite.SQLiteRunResult> {
        try {
            const db = getDb();
            const result = (await db).runAsync(
                'DELETE FROM Categorias WHERE Id = ?',
                [id]
            );
            return result;
        } catch (error) {
            console.error('Erro delete', error);
            throw new Error('erro ao deletar categoria');
        }
    }
    async update(categoria: Categoria): Promise<SQLite.SQLiteRunResult | undefined> {
        try {
            const db = await getDb();
            return await db.runAsync(
                'UPDATE Categorias SET Nome = ? WHERE Id = ?',
                [categoria.Nome, categoria.Id]
            )
        } catch (error) {
            console.error('Erro update', error);
            throw new Error('Erro ao atualizar a categoria')
        }
    }
}