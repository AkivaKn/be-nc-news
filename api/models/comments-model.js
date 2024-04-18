const db = require("../connection");

exports.selectComments = (username, article_id, limit = 10, p = 1, sort_by = 'created_at',order = 'desc') => {
  return validateInputs(limit, p, sort_by, order)
    .then(() => {
      let sqlStr = `SELECT * FROM comments `;
      const queryVals = [];
    
      if (username) {
        sqlStr += `WHERE author=$1 `;
        queryVals.push(username);
      } else if (article_id) {
        sqlStr += `WHERE article_id=$1 `;
        queryVals.push(article_id);
      }
    
      sqlStr += `ORDER BY ${sort_by} ${order} LIMIT ${limit} OFFSET ${
        (p - 1) * limit
      };`;
      return db.query(sqlStr, queryVals).then(({ rows }) => {
        return rows;
      });
  })
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
  return db
    .query(`DELETE FROM comments WHERE comment_id = $1 RETURNING *;`, [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
    });
};

exports.updateComment = (comment_id, inc_votes) => {
  return db
    .query(
      `UPDATE comments 
  SET votes=votes+$1
  WHERE comment_id=$2 RETURNING *;`,
      [inc_votes, comment_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Comment not found" });
      }
      return rows[0];
    });
};

function validateInputs  (limit, p, sort_by, order)  {
  const validSortBy = ['comment_id', 'votes','created_at', 'author', 'body', 'article_id'];
  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({status:400,msg:'Bad request'})
  }
  const validOrder = ['desc', 'asc']
  if (!validOrder.includes(order.toLowerCase())) {
    return Promise.reject({status:400,msg:'Bad request'})
  }
  if (!Number(limit)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  if (!Number(p)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }
  return Promise.resolve()
}
