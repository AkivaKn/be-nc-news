const request = require("supertest");
const app = require("../db/app");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const endpoints = require("../endpoints.json");
const { reduceRight } = require("../db/data/test-data/articles");

afterAll(() => {
  db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("Error handling", () => {
  test("404 Not found: Responds appropriately when endpoint does not exist", () => {
    return request(app)
      .get("/api/does-not-exist")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("Path not found");
      });
  });
});
describe("/api/topics", () => {
  describe("GET", () => {
    test("GET 200: Responds with an array of topic objects each containing a slug and description key", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body: { topics } }) => {
          expect(topics.length).toBe(3);
          topics.forEach((topic) => {
            expect(typeof topic.description).toBe("string");
            expect(typeof topic.slug).toBe("string");
          });
        });
    });
  });
});
describe("/api", () => {
  test("GET 200: Responds with enpoints.json file", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body).toEqual(endpoints);
      });
  });
});
describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("GET 200: Responds with an article object with the correct keys", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article.author).toBe("butter_bridge");
          expect(article.title).toBe("Living in the shadow of a great man");
          expect(article.article_id).toBe(1);
          expect(article.body).toBe("I find this existence challenging");
          expect(article.topic).toBe("mitch");
          expect(article.created_at).toBe("2020-07-09T20:11:00.000Z");
          expect(article.votes).toBe(100);
          expect(article.article_img_url).toBe(
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
          );
        });
    });
    test("GET 404: Responds with article not found when passed an article_id with no corresponding article", () => {
      return request(app)
        .get("/api/articles/100")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article not found");
        });
    });
    test("GET 400: Responds with bad request if passed an article_id value which is not an integer", () => {
      return request(app)
        .get("/api/articles/not-a-number")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
describe("/api/articles", () => {
  describe("GET", () => {
    test("GET 200: Responds with an array of article objects, with a comment_count key and no body key", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles.length).toBe(13);
          expect(articles[0].comment_count).toBe(2);
          articles.forEach((article) => {
            expect(typeof article.author).toBe("string");
            expect(typeof article.title).toBe("string");
            expect(typeof article.article_id).toBe("number");
            expect(typeof article.topic).toBe("string");
            expect(typeof article.created_at).toBe("string");
            expect(typeof article.votes).toBe("number");
            expect(typeof article.article_img_url).toBe("string");
            expect(typeof article.comment_count).toBe("number");
            expect(article.body).toBe(undefined);
          });
        });
    });
    test("GET 200: Array has default sorting of desc by date(created_at)", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("created_at", { descending: true });
        });
    });
  });
});
describe("/api/articles/:article_id/comments", () => {
  describe("GET", () => {
    test("GET 200: Responds with an array of comments with the correct keys", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(11);
          comments.forEach((comment) => {
            expect(typeof comment.comment_id).toBe("number");
            expect(typeof comment.votes).toBe("number");
            expect(typeof comment.created_at).toBe("string");
            expect(typeof comment.author).toBe("string");
            expect(typeof comment.body).toBe("string");
            expect(typeof comment.article_id).toBe("number");
          });
        });
    });
    test("GET 200: Response is sorted by default by date descending", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("GET 200: Responds with an empty array if requested an article that exists but has no comments", () => {
      return request(app)
        .get("/api/articles/2/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(0);
        });
    });
    test("GET 404: Returns article not found if no such article exists", () => {
      return request(app)
        .get("/api/articles/100/comments")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article not found");
        });
    });
  });
  describe("POST", () => {
    test("POST 201: Returns newly created comment", () => {
      const newComment = {
        username: "lurker",
        body: "This is an example comment",
      };
      return request(app)
        .post("/api/articles/2/comments")
        .send(newComment)
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment.body).toBe(newComment.body);
          expect(comment.author).toBe(newComment.username);
          expect(comment.comment_id).toBeNumber();
          expect(comment.votes).toBe(0);
          expect(comment.created_at).toBeString();
          expect(comment.article_id).toBe(2);
        });
    });
    test("POST 404: Returns article not found if article_id does not exist", () => {
      const newComment = {
        username: "lurker",
        body: "This is an example comment",
      };
      return request(app)
        .post("/api/articles/200/comments")
        .send(newComment)
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article not found");
        });
    });
    test("POST 400: Returns bad request when passed an article_id that is not an integer", () => {
      const newComment = {
        username: "lurker",
        body: "This is an example comment",
      };
      return request(app)
        .post("/api/articles/not-a-number/comments")
        .send(newComment)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("POST 400: Returns bad request when passed incomplete data", () => {
      const newComment = {
        body: "This is an example comment",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
