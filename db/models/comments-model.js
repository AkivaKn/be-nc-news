const db = require("../connection");
const { selectArticleById } = require("./articles-model");

exports.selectComments = (article_id) => {
  return selectArticleById(article_id)
    .then(() => {
      return db.query(
        `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`,
        [article_id]
      );
    })
    .then(({ rows }) => {
      return rows;
    });
};
