const db = require("../connection");

exports.selectUsers = () => {
  return db.query(`SELECT username,name,avatar_url, COUNT(comment_id)::int as comment_count FROM users LEFT JOIN comments ON comments.author=users.username GROUP BY users.username ;`).then(({ rows }) => {
    return rows;
  });
};

exports.selectUserByUsername = (username) => {
  return db
    .query(`SELECT username,name,avatar_url, COUNT(comment_id)::int as comment_count FROM users LEFT JOIN comments ON comments.author=users.username WHERE username = $1 GROUP BY users.username ;`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "User not found" });
      }
      return rows[0];
    });
};

exports.checkUsernameExists = (username) => {
  if (username) {
    return db
      .query(`SELECT * FROM users WHERE username = $1;`, [username])
      .then(({ rows }) => {
        if (rows.length === 0) {
          return Promise.reject({ status: 404, msg: "Username not found" });
        }
      });
  } else {
    return Promise.resolve();
  }
};

exports.removeUser = (username) => {
  return db.query(`DELETE FROM users WHERE username = $1 RETURNING *;`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
      return Promise.reject({status:404,msg:'Username not found'})
    }
  })
}