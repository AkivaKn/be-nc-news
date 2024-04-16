const db = require("../connection");

exports.selectArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id=$1;`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "Article not found" });
      }
      return rows[0];
    });
};

exports.selectArticles = () => {
  return db
    .query(
      `SELECT articles.author,title,articles.article_id,topic,articles.created_at,articles.votes,article_img_url, COUNT(comment_id) AS comment_count 
    FROM articles 
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id 
    GROUP BY
    articles.article_id
    ORDER BY articles.created_at DESC;`
    )
    .then(({ rows }) => {
      rows.forEach((article) => {
        article.comment_count = Number(article.comment_count);
      });
      return rows;
    });
};

exports.updateArticle = (article_id, inc_votes) => {
  return this.selectArticleById(article_id)
    .then(() => {
      return db.query(`UPDATE articles 
    SET votes=votes+$1
    WHERE article_id = $2 RETURNING *;`, [inc_votes, article_id])
    
  })
    .then(({ rows }) => {
   return rows[0]
    })
}
