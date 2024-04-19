const { checkExists } = require("./utils-model");
const db = require("../connection");
const sql = require('yesql').pg;


exports.selectComments = (username, article_id, limit = 10, p = 1, sort_by = 'created_at', order = 'desc') => {
  return this.commentsLength(username, article_id)
    .then((comment_count) => {
      return Promise.all([validateInputs(limit, p, sort_by, order,comment_count),checkExists('articles','article_id',article_id,'Article'),checkExists('users','username',username,'Username')])
  })
    .then(() => {
      let sqlStr = `SELECT * FROM comments `;
      const queryVals = {lim:limit,page:(p-1)*limit};
    
      if (username) {
        queryVals.user = username;
        sqlStr += `WHERE author=:user `;
      } else if (article_id) {
        queryVals.article = article_id;
        sqlStr += `WHERE article_id=:article `;
      }
    
      sqlStr += `ORDER BY ${sort_by} ${order} LIMIT :lim OFFSET :page;`;
      return db.query(sql(sqlStr)(queryVals)).then(({ rows }) => {
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

function validateInputs  (limit, p, sort_by, order,comment_count)  {
  const validSortBy = ['comment_id', 'votes','created_at', 'author', 'body', 'article_id'];
  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({status:400,msg:'Bad request'})
  }
  const validOrder = ['desc', 'asc']
  if (!validOrder.includes(order.toLowerCase())) {
    return Promise.reject({status:400,msg:'Bad request'})
  }
  if ((p - 1) * limit > comment_count) {
    return Promise.reject({status:404,msg:'Page not found'})
  }
  return Promise.resolve()
}

exports.commentsLength = (username, article_id) => {
  let sqlStr = `SELECT * FROM comments `
  const queryVals = {};
  if (username) {
    queryVals.user = username;
    sqlStr += `WHERE author=:user`;
  } else if (article_id) {
    queryVals.article = article_id;
    sqlStr += `WHERE article_id=:article`;
  }
  sqlStr += `;`;
  return db.query(sql(sqlStr)(queryVals))
    .then(({ rows }) => {
      return rows.length
  })
}
