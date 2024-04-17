const db = require("../connection");

exports.selectComments = (article_id) => {
      return db.query(
        `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
        [article_id]
      )
    .then(({ rows }) => {
      return rows;
    });
};

exports.insertComment = (article_id, username, body) => {
  if (body.length === 0) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  return db
    .query(
      `INSERT INTO comments (author,body,article_id) 
      VALUES ($1,$2,$3)
      RETURNING *;`,
      [username, body, article_id]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

exports.removeComment = (comment_id) => {
  return db.query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [comment_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
      return Promise.reject({status:404,msg:'Comment not found'})
    }
  })
}

exports.updateComment = (comment_id, inc_votes) => {
  return db.query(`UPDATE comments 
  SET votes=votes+$1
  WHERE comment_id=$2 RETURNING *;`, [inc_votes, comment_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({status:404,msg:'Comment not found'})
      }
    return rows[0]
  })
}
