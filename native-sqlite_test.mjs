import test from "node:test";
import assert from "node:assert";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { tmpdir } from 'node:os';
import fs from "node:fs";

/*
 * Deno: deno test --allow-all
 * Node: node --test
 */

test("Test node:sqlite (exec)", async () => {
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'test-sqlite-'));
    const dbPath = path.join(tempDir, "MyDB.db");
    const db = new DatabaseSync(dbPath)
    db.exec("CREATE TABLE test (key INTEGER PRIMARY KEY, value TEXT)");
    db.close();
    fs.rmSync(tempDir, {
        recursive: true,
    })
})

test("Test node:sqlite (prepare)", async () => {
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'test-sqlite-'));
    const dbPath = path.join(tempDir, "MyDB.db");
    const db = new DatabaseSync(dbPath)
    const statement = db.prepare("CREATE TABLE test (key INTEGER PRIMARY KEY, value TEXT)");
    statement.run();
    db.close();
    fs.rmSync(tempDir, {
        recursive: true,
    })
});

test("Test node:sqlite (prepare without run)", async () => {
    const tempDir = fs.mkdtempSync(path.join(tmpdir(), 'test-sqlite-'));
    const dbPath = path.join(tempDir, "MyDB.db");
    const db = new DatabaseSync(dbPath)
    const statement = db.prepare("CREATE TABLE test (key INTEGER PRIMARY KEY, value TEXT)");
    //statement.run();
    db.close();
    fs.rmSync(tempDir, {
        recursive: true,
    })
});
