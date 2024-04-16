const db = require("../connection");

exports.selectArticleById = (article_id) => {
  return db
    .query(`SELECT articles.author,title,articles.article_id,articles.body,topic,articles.created_at,articles.votes,article_img_url, COUNT(comment_id) AS comment_count 
    FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id 
    WHERE articles.article_id = $1 
    GROUP BY 
    articles.article_id;
    `, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
        rows[0].comment_count = Number(rows[0].comment_count);
      return rows[0];
    });
};

exports.selectArticles = (topic, sort_by = 'created_at',order = 'desc') => {
  const validSortBy = ['author', 'title',' article_id', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count'];
  if (!validSortBy.includes(sort_by)) {
    return Promise.reject({status:400,msg:'Bad request'})
  }

  const validOrder = ['desc', 'asc']
  if (!validOrder.includes(order.toLowerCase())) {
    return Promise.reject({status:400,msg:'Bad request'})
  }

  let sqlStr = `SELECT articles.author,title,articles.article_id,topic,articles.created_at,articles.votes,article_img_url, COUNT(comment_id) AS comment_count 
  FROM articles 
  LEFT JOIN comments 
  ON articles.article_id = comments.article_id 
  `;
  const queryVals = [];

  if (topic) {
    sqlStr += `WHERE topic = $1`;
    queryVals.push(topic);
  }
  sqlStr += ` GROUP BY
  articles.article_id ORDER BY articles.${sort_by} ${order};`;
  return db.query(sqlStr, queryVals).then(({ rows }) => {
    rows.forEach((article) => {
      article.comment_count = Number(article.comment_count);
    });
    return rows;
  });
};

exports.updateArticle = (article_id, inc_votes) => {
  return db
    .query(
      `UPDATE articles 
    SET votes=votes+$1
    WHERE article_id = $2 RETURNING *;`,
      [inc_votes, article_id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.checkArticleExists = (article_id) => {
  return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
      return Promise.reject({status:404,msg:'Article not found'})
    }
  })
}