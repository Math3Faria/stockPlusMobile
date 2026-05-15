import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | undefined;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
    try {
        if (!db) {

            db = await SQLite.openDatabaseAsync('app.db');

            await db.execAsync('PRAGMA foreign_keys = ON');
        }
        return db;
    } catch (error) {
        console.error("Erro ao obter banco:", error);
        throw new Error('Erro ao inicializar getDb');
    }
}

export async function resetDatabase() {
    try {
        const db = await getDb();
        await db.closeAsync();
        await SQLite.deleteDatabaseAsync('app.db');
        console.log('Banco de dados deletado com sucesso');
    } catch (error) {
        console.error("Erro ao deletar banco:", error);
    }
}

export async function initDB() {
    try {
        const database = await getDb();

        await database.execAsync(`
      CREATE TABLE IF NOT EXISTS categorias (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        Nome TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS produtos (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        CategoriaId INTEGER,
        Nome TEXT NOT NULL,
        Valor REAL,
        DataCad TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (CategoriaId) REFERENCES categorias(id)
      );
    `);

        console.log("Tabelas inicializadas com sucesso");
    } catch (error) {
        console.error("Erro ao criar tabelas:", error);
    }
}
