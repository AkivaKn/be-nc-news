const format = require("pg-format");
const db = require("../connection");

exports.checkExists = (table, column, value, item_name) => {
    if (value) {
      const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);
      return db.query(queryStr, [value]).then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: `${item_name} not found` });
        }
      });
    } else {
      return Promise.resolve();
    }
  };