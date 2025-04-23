const Client_SQLite3 = require("knex/lib/dialects/sqlite3/index.js");
const { DatabaseSync } = require("node:sqlite");

class NativeSQLiteClient extends Client_SQLite3 {
    _driver() {
        return true;
    }

    /**
     * @returns {Promise<module:node:sqlite.DatabaseSync>}
     */
    async acquireRawConnection() {
        const options = this.connectionSettings.options || {};
        return new DatabaseSync(this.connectionSettings.filename, {
            readOnly: !!options.readonly,
        });
    }

    /**
     * @param {module:node:sqlite.DatabaseSync} connection
     * @returns {Promise<void>}
     */
    async destroyRawConnection(connection) {
        console.log(connection)
        connection.close();
    }

    /**
     * @param {module:node:sqlite.DatabaseSync} connection
     * @param {object} obj
     * @returns {Promise<{sql}|*>}
     * @private
     */
    async _query(connection, obj) {
        if (!obj.sql) throw new Error("The query is empty");

        if (!connection) {
            throw new Error("No connection provided");
        }

        const statement = connection.prepare(obj.sql);
        const bindings = this._formatBindings(obj.bindings);
        const callMethod = this.getCallMethod(obj);

        if (callMethod === "all") {
            obj.response = statement.all(bindings);
            return obj;
        }

        obj.response = statement.run(bindings);
        obj.context = {
            lastID: obj.response.lastInsertRowid,
            changes: obj.response.changes,
        };

        return obj;
    }

    _formatBindings(bindings) {
        if (!bindings) {
            return [];
        }
        return bindings.map((binding) => {
            if (binding instanceof Date) {
                return binding.valueOf();
            }

            if (typeof binding === "boolean") {
                return Number(binding);
            }

            return binding;
        });
    }

    /**
     * This code originally from knex/lib/dialects/sqlite3/index.js
     * @param {object} obj
     * @returns {string}
     */
    getCallMethod(obj) {
        const { method } = obj;
        let callMethod;
        switch (method) {
            case 'insert':
            case 'update':
                callMethod = obj.returning ? 'all' : 'run';
                break;
            case 'counter':
            case 'del':
                callMethod = 'run';
                break;
            default:
                callMethod = 'all';
        }
        return callMethod;
    }
}

Object.assign(NativeSQLiteClient.prototype, {
    // The "dialect", for reference .
    driverName: "native-sqlite3",
});

module.exports = {
    NativeSQLiteClient,
};
