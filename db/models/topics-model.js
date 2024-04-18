const db = require("../connection");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics;`).then(({ rows }) => {
    return rows;
  });
};

exports.checkTopicExists = (topic) => {
    if (topic !== undefined) {
        return db
          .query(`SELECT * FROM topics WHERE slug = $1;`, [topic])
          .then(({ rows }) => {
            if (rows.length === 0) {
              return Promise.reject({ status: 404, msg: "Topic not found" });
            }
          });
    } else {
       return Promise.resolve()
  }
};

exports.insertTopic = (newTopic) => {
  return db.query(`INSERT INTO topics (slug,description) VALUES ($1,$2) RETURNING *;`, [newTopic.slug, newTopic.description])
    .then(({ rows }) => {
    return rows[0]
  })
}

exports.removeTopic = (slug) => {
  return db.query(`DELETE FROM topics WHERE slug=$1 RETURNING *;`, [slug])
    .then(({ rows }) => {
      if (rows.length === 0) {
      return Promise.reject({status:404,msg:'Topic not found'})
    }
  })
}
