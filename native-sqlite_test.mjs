import test from "node:test";
import assert from "node:assert";
import { createRequire } from "node:module";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { tmpdir } from 'node:os';
import fs from "node:fs";
import Knex from "knex";

const require = createRequire(import.meta.url);
const { NativeSQLiteClient } = require("./native-sqlite.cjs");

test("Raw node:sqlite (exec)", async () => {
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'knex-native-sqlite-'));
    const dbPath = path.join(tempDir, "MyDB.db");
    const db = new DatabaseSync(dbPath)
    db.exec("CREATE TABLE test (key INTEGER PRIMARY KEY, value TEXT)");
    db.close();
    fs.rmSync(tempDir, {
        recursive: true,
    })
})

test("Raw node:sqlite (prepare)", async () => {
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'knex-native-sqlite-'));
    const dbPath = path.join(tempDir, "MyDB.db");
    const db = new DatabaseSync(dbPath)
    const statement = db.prepare("CREATE TABLE test (key INTEGER PRIMARY KEY, value TEXT)");
    statement.run();
    db.close();
    fs.rmSync(tempDir, {
        recursive: true,
    })
})

test("Write a db to filesystem", async () => {
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'knex-native-sqlite-'));
    const dbPath = path.join(tempDir, "MyDB.db");

    const knex = Knex({
        client: NativeSQLiteClient,
        connection: {
            filename: dbPath,
        },
        useNullAsDefault: true,
    });

    // create a data table with key (INTEGER PRIMARY KEY) and value (TEXT)
    await knex.schema.createTable("test", (table) => {
        table.increments("key").primary();
        table.string("value");
    });

    // Clear up
    await knex.destroy();

    // Check file exists
    const fileExists = fs.existsSync(dbPath);
    assert.strictEqual(fileExists, true);

    fs.rmSync(tempDir, {
        recursive: true,
    })
});

test("SELECT 1", async () => {
    const knex = Knex({
        client: NativeSQLiteClient,
        connection: {
            filename: ':memory:',
        },
    });
    await knex.destroy();
});
