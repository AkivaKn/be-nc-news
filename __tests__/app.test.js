const request = require("supertest");
const app = require("../api/app");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../api/connection");
const endpoints = require("../endpoints.json");

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
  describe("POST", () => {
    test("POST 201: Responds with newly posted topic", () => {
      const newTopic = {
        slug: "example_name",
        description: "example description",
      };
      return request(app)
        .post("/api/topics")
        .send(newTopic)
        .expect(201)
        .then(({ body: { topic } }) => {
          expect(topic).toMatchObject(newTopic);
        });
    });
    test("POST 400: Returns bad request when passed incomplete data", () => {
      const newTopic = {
        description: "example description",
      };
      return request(app)
        .post("/api/topics")
        .send(newTopic)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
describe("/api/topics/:slug", () => {
  describe("DELETE", () => {
    test("DELETE 204: Deletes specified topic and associated articles", () => {
      return request(app).delete("/api/topics/mitch").expect(204);
    });
    test("DELETE 404: Returns not found if no such topic exists", () => {
      return request(app)
        .delete("/api/topics/not_a_topic")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Topic not found");
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
          expect(articles.length).toBeGreaterThan(0);
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
    test("GET 200: Accepts query of topic and filters by given topic", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(1);
          expect(articles[0].topic).toBe("cats");
        });
    });
    test("GET 200: Responds with an empty array if no articles are associated with given topic", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(0);
        });
    });
    test("GET 200: Accepts query of sort_by for any valid column", () => {
      return request(app)
        .get("/api/articles?sort_by=author")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("author", { descending: true });
        });
    });
    test("GET 200: Accepts query of order and sorts accordingly", () => {
      return request(app)
        .get("/api/articles?sort_by=author&&order=asc")
        .then(({ body: { articles } }) => {
          expect(articles).toBeSortedBy("author");
        });
    });
    test("GET 200: Defaults to returning 10 articles", () => {
      return request(app)
        .get("/api/articles")
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(10);
        });
    });
    test("GET 200: Accepts a limit query and returns accordingly", () => {
      return request(app)
        .get("/api/articles?limit=5")
        .then(({ body: { articles } }) => {
          expect(articles).toHaveLength(5);
        });
    });
    test("GET 200: Accepts a p(page) query and returns accordingly", () => {
      return request(app)
        .get("/api/articles?p=2&&sort_by=article_id&&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles[0].article_id).toBe(11);
          expect(articles).toHaveLength(3);
        });
    });
    test('GET 404: Returns page not found when page does not exist', () => {
      return request(app)
        .get('/api/articles?p=100')
        .expect(404)
        .then(({ body: { msg } }) => {
        expect(msg).toBe('Page not found')
      })
    })
    test("GET 200: Returns articles with a total_count property matching the number of articles returned", () => {
      return request(app)
        .get("/api/articles?topic=cats")
        .expect(200)
        .then(({ body: { article_count } }) => {
         expect(article_count).toBe(1)
        });
    });
    test("GET 200: Ignores limit when returning total_count property", () => {
      return request(app)
        .get("/api/articles")
        .expect(200)
        .then(({ body: { articles,article_count } }) => {
          expect(articles).toHaveLength(10);
          expect(article_count).toBe(13)
        });
    });
    test("GET 200: Ignores limit when returning comment_count property", () => {
      return request(app)
        .get("/api/articles?sort_by=article_id&&order=asc")
        .expect(200)
        .then(({ body: { articles } }) => {
          expect(articles[0].comment_count).toBe(11);
        });
    });
    test("GET 400: Returns bad request when limit provided is not a number", () => {
      return request(app)
        .get("/api/articles?limit=45;SELECT * FROM articles;")
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 400: Returns bad request when p provided is not a number", () => {
      return request(app)
        .get(
          "/api/articles?p=2 SELECT * FROM articles;&&sort_by=article_id&&order=asc"
        )
        .expect(400);
    });
    test("GET 404: Returns not found if topic does not exist", () => {
      return request(app)
        .get("/api/articles?topic=not_a_topic")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Topic not found");
        });
    });
    test("GET 400: Returns bad request if sort_by is not a valid column", () => {
      return request(app)
        .get("/api/articles?sort_by=not_a_column")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 400: Returns bad request if order is not asc or desc", () => {
      return request(app)
        .get("/api/articles?order=incorrect")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("POST", () => {
    test("POST 201: Responds with the newly created article", () => {
      const newArticle = {
        title: "Sony Vaio; or, The Laptop",
        topic: "mitch",
        author: "icellusedkars",
        body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      const expected = {
        title: "Sony Vaio; or, The Laptop",
        topic: "mitch",
        author: "icellusedkars",
        body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        article_id: expect.any(Number),
        votes: 0,
        created_at: expect.any(String),
        comment_count: 0,
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject(expected);
        });
    });
    test("POST 201: Responds with newly created article with default article_img_url", () => {
      const newArticle = {
        title: "Sony Vaio; or, The Laptop",
        topic: "mitch",
        author: "icellusedkars",
        body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
      };
      const expected = {
        title: "Sony Vaio; or, The Laptop",
        topic: "mitch",
        author: "icellusedkars",
        body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
        article_img_url: expect.any(String),
        article_id: expect.any(Number),
        votes: 0,
        created_at: expect.any(String),
        comment_count: 0,
      };
    });
    test("POST 400: Returns bad request when passed incomplete data", () => {
      const newArticle = {
        title: "Sony Vaio; or, The Laptop",
        topic: "mitch",
        body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("POST 400: Returns bad request when passed with a topic that is not in database", () => {
      const newArticle = {
        title: "Sony Vaio; or, The Laptop",
        topic: "not_a_topic",
        author: "icellusedkars",
        body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("POST 400: Returns bad request when passed with an author that is not in database", () => {
      const newArticle = {
        title: "Sony Vaio; or, The Laptop",
        topic: "mitch",
        author: "not_an_author",
        body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
});
describe("/api/articles/:article_id", () => {
  describe("GET", () => {
    test("GET 200: Responds with an article object with the correct keys", () => {
      const expected = {
        author: "butter_bridge",
        title: "Living in the shadow of a great man",
        article_id: 1,
        body: "I find this existence challenging",
        topic: "mitch",
        created_at: expect.any(String),
        votes: 100,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject(expected);
        });
    });
    test("GET 200: Response object includes a comment_count key", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article.comment_count).toBe(11);
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
  describe("PATCH", () => {
    test("PATCH 200: Responds with updated object when passed an object with votes in the correct syntax", () => {
      const expected = {
        author: "butter_bridge",
        title: "Living in the shadow of a great man",
        article_id: 1,
        body: "I find this existence challenging",
        topic: "mitch",
        created_at: expect.any(String),
        votes: 110,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: 10 })
        .expect(200)
        .then(({ body: { article } }) => {
          expect(article).toMatchObject(expected);
        });
    });
    test("PATCH 400: Responds with bad request when passed an object with no inc_votes key", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ votes: 10 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: Responds with bad request when passed a value of inc_votes which is not a number", () => {
      return request(app)
        .patch("/api/articles/1")
        .send({ inc_votes: "not a number" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: Responds with bad request when passed an article_id which is not a number", () => {
      return request(app)
        .patch("/api/articles/first_article")
        .send({ inc_votes: 10 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 404: Responds with not found when passed an article_id which does not exist", () => {
      return request(app)
        .patch("/api/articles/100")
        .send({ inc_votes: 5 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article not found");
        });
    });
  });
  describe("DELETE", () => {
    test("DELETE 204: Deletes specified article and responds with 204", () => {
      return request(app).delete("/api/articles/1").expect(204);
    });
    test("DELETE 404: Returns not found when article does not exist", () => {
      return request(app)
        .delete("/api/articles/100")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Article not found");
        });
    });
    test("DELETE 404: Returns bad request when article_id is not a number", () => {
      return request(app)
        .delete("/api/articles/not_a_number")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
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
          expect(comments.length).toBeGreaterThan(0);
          comments.forEach((comment) => {
            expect(typeof comment.comment_id).toBe("number");
            expect(typeof comment.votes).toBe("number");
            expect(typeof comment.created_at).toBe("string");
            expect(typeof comment.author).toBe("string");
            expect(typeof comment.body).toBe("string");
            expect(comment.article_id).toBe(1);
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
    test("GET 200: Accepts a limit query and responds accordingly", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=2")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(2);
        });
    });
    test("GET 200: Response has default pagination of 10", () => {
      return request(app)
        .get("/api/articles/1/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(10);
        });
    });
    test("GET 200: Accepts a p(page) query and responds accordingly", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=2&&p=2")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments[0].comment_id).toBe(18);
        });
    });
    test('GET 200: Accepts a sort_by query and responds accordingly', () => {
      return request(app)
        .get('/api/articles/1/comments?sort_by=votes')
        .expect(200)
        .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy('votes',{descending:true})
      })
    })
    test('GET 200: Accepts an order query and responds accordingly', () => {
      return request(app)
        .get('/api/articles/1/comments?order=asc')
        .expect(200)
        .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy('created_at')
      })
    })
    test('GET 400: Returns bad request if order is not asc or desc', () => {
      return request(app)
        .get("/api/articles/1/comments?order=incorrect")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    })
    test('GET 400: Returns bad request if sort_by is not a valid column', () => {
      return request(app)
        .get('/api/articles/1/comments?sort_by=not_a_column')
        .expect(400)
        .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request')
      })
    })
    test("GET 400: Returns bad request when limit provided is not a number", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=45;SELECT * FROM articles;")
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 400: Returns bad request when page provided is not a number", () => {
      return request(app)
        .get("/api/articles/1/comments?p=5;SELECT * FROM articles;")
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
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
    test("GET 400: Returns bad request if article_id is not an integer", () => {
      return request(app)
        .get("/api/articles/not-a-number/comments")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("POST", () => {
    test("POST 201: Returns newly created comment", () => {
      const newComment = {
        username: "lurker",
        body: "This is an example comment",
      };
      const expected = {
        body: "This is an example comment",
        author: "lurker",
        comment_id: expect.any(Number),
        votes: 0,
        created_at: expect.any(String),
        article_id: 2,
      };
      return request(app)
        .post("/api/articles/2/comments")
        .send(newComment)
        .expect(201)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject(expected);
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
    test("POST 400: Returns bad request when passed a new comment with a body that is an empty string", () => {
      const newComment = {
        username: "lurker",
        body: "",
      };
      return request(app)
        .post("/api/articles/1/comments")
        .send(newComment)
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("POST 400: Returns bad request when passed a new comment with a username which doesn't exist", () => {
      const newComment = {
        username: "not a username",
        body: "I am a comment",
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
describe('/api/comments', () => {
  describe('GET', () => {
    test('GET 200: Responds with an array of all comments', () => {
      return request(app)
        .get('/api/comments')
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBeGreaterThan(0)
          comments.forEach((comment) => {
            expect(typeof comment.comment_id).toBe("number");
            expect(typeof comment.votes).toBe("number");
            expect(typeof comment.created_at).toBe("string");
            expect(typeof comment.author).toBe("string");
            expect(typeof comment.body).toBe("string");
            expect(typeof comment.article_id).toBe('number');
          })
      })
    })
    test("GET 200: Response is sorted by default by date descending", () => {
      return request(app)
        .get("/api/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("GET 200: Accepts a limit query and responds accordingly", () => {
      return request(app)
        .get("/api/comments?limit=2")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(2);
        });
    });
    test("GET 200: Response has default pagination of 10", () => {
      return request(app)
        .get("/api/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(10);
        });
    });
    test("GET 200: Accepts a p(page) query and responds accordingly", () => {
      return request(app)
        .get("/api/comments?limit=2&&p=2")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments[0].comment_id).toBe(2);
        });
    });
    test('GET 200: Accepts a sort_by query and responds accordingly', () => {
      return request(app)
        .get('/api/comments?sort_by=votes')
        .expect(200)
        .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy('votes',{descending:true})
      })
    })
    test('GET 200: Accepts an order query and responds accordingly', () => {
      return request(app)
        .get('/api/comments?order=asc')
        .expect(200)
        .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy('created_at')
      })
    })
    test('GET 400: Returns bad request if order is not asc or desc', () => {
      return request(app)
        .get("/api/comments?order=incorrect")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    })
    test('GET 400: Returns bad request if sort_by is not a valid column', () => {
      return request(app)
        .get('/api/comments?sort_by=not_a_column')
        .expect(400)
        .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request')
      })
    })
    test('GET 404: Returns page not found when page does not exist', () => {
      return request(app)
        .get('/api/comments?p=100')
        .expect(404)
        .then(({ body: { msg } }) => {
        expect(msg).toBe('Page not found')
      })
    })
    test("GET 400: Returns bad request when limit provided is not a number", () => {
      return request(app)
        .get("/api/comments?limit=45;SELECT * FROM articles;")
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 400: Returns bad request when page provided is not a number", () => {
      return request(app)
        .get("/api/comments?p=5;SELECT * FROM articles;")
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  })
})
describe("/api/commments/:comment_id", () => {
  describe("DELETE", () => {
    test("DELETE 204: Returns a status 204 when passed a comment_id to delete", () => {
      return request(app).delete("/api/comments/1").expect(204);
    });
    test("DELETE 404: Returns not found when comment does not exist", () => {
      return request(app)
        .delete("/api/comments/100")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Comment not found");
        });
    });
    test("DELETE 400: Returns bad request when comment_id is not a number", () => {
      return request(app)
        .delete("/api/comments/not_a_number")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
  });
  describe("PATCH", () => {
    test("PATCH 200: Responds with updated user", () => {
      const expected = {
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        votes: 19,
        author: "butter_bridge",
        article_id: 9,
        created_at: expect.any(String),
      };
      return request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: 3 })
        .expect(200)
        .then(({ body: { comment } }) => {
          expect(comment).toMatchObject(expected);
        });
    });
    test("PATCH 400: Responds with bad request when sent object does not include an inc_votes key", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({ votes: 3 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: Responds with bad request when sent object include an inc_votes key which is not a number", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: "not_a_number" })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 400: Responds with bad request when comment_id is not an integer", () => {
      return request(app)
        .patch("/api/comments/not_a_number")
        .send({ inc_votes: 3 })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("PATCH 404: Responds with not found when no such comment exists", () => {
      return request(app)
        .patch("/api/comments/100")
        .send({ inc_votes: 3 })
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Comment not found");
        });
    });
  });
});
describe("/api/users", () => {
  describe("GET", () => {
    test("GET 200: Returns an array of users", () => {
      return request(app)
        .get("/api/users")
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users).toHaveLength(4);
          users.forEach((user) => {
            expect(typeof user.username).toBe("string");
            expect(typeof user.name).toBe("string");
            expect(typeof user.avatar_url).toBe("string");
          });
        });
    });
    test('GET 200: Response has comment_count key corresponding to the amount of comments associated with users', () => {
      return request(app)
        .get('/api/users')
        .expect(200)
        .then(({ body: { users } }) => {
          expect(users[3].comment_count).toBe(5)
          users.forEach((user) => {
            expect(typeof user.comment_count).toBe('number')
          })
      })
    })
  });
});
describe("/api/users/:username", () => {
  describe("GET", () => {
    test("GET 200: Responds with requested username object", () => {
      return request(app)
        .get("/api/users/icellusedkars")
        .expect(200)
        .then(({ body: { user } }) => {
          expect(user.username).toBe("icellusedkars");
          expect(user.name).toBe("sam");
          expect(user.avatar_url).toBe(
            "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4"
          );
        });
    });
    test('GET 200: Response has comment_count key corresponding to the amount of comments associated with that user', () => {
      return request(app)
        .get('/api/users/icellusedkars')
        .expect(200)
        .then(({ body: { user } }) => {
        expect(user.comment_count).toBe(13)
      })
    })
    test("GET 404: Responds with an appropriate error message if no such user exist", () => {
      return request(app)
        .get("/api/users/not_a_user")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("User not found");
        });
    });
  });
  describe('DELETE', () => {
    test('DELETE 204: Deletes specified user and responds with 204', () => {
      return request(app)
        .delete('/api/users/icellusedkars')
      .expect(204)
    })
    test('DELETE 404: Returns not found when user does not exist', () => {
      return request(app)
        .delete('/api/users/not_a_user')
        .expect(404)
        .then(({ body: { msg } }) => {
        expect(msg).toBe('Username not found')
      })
    })
  })
});
describe("/api/users/:username/comments", () => {
  describe("GET", () => {
    test("GET 200: Responds with an array of comments with the correct keys", () => {
      return request(app)
        .get("/api/users/icellusedkars/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBeGreaterThan(0);
          comments.forEach((comment) => {
            expect(typeof comment.comment_id).toBe("number");
            expect(typeof comment.votes).toBe("number");
            expect(typeof comment.created_at).toBe("string");
            expect(comment.author).toBe("icellusedkars");
            expect(typeof comment.body).toBe("string");
            expect(typeof comment.article_id).toBe("number");
          });
        });
    });
    test("GET 200: Response is sorted by default by date descending", () => {
      return request(app)
        .get("/api/users/icellusedkars/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toBeSortedBy("created_at", { descending: true });
        });
    });
    test("GET 200: Responds with an empty array if requested a user that exists but has no comments", () => {
      return request(app)
        .get("/api/users/lurker/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments.length).toBe(0);
        });
    });
    test("GET 200: Accepts a limit query and responds accordingly", () => {
      return request(app)
        .get("/api/users/icellusedkars/comments?limit=2")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(2);
        });
    });
    test("GET 200: Response has default pagination of 10", () => {
      return request(app)
        .get("/api/users/icellusedkars/comments")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments).toHaveLength(10);
        });
    });
    test("GET 200: Accepts a p(page) query and responds accordingly", () => {
      return request(app)
        .get("/api/users/icellusedkars/comments?limit=2&&p=2")
        .expect(200)
        .then(({ body: { comments } }) => {
          expect(comments[0].comment_id).toBe(10);
        });
    });
    test('GET 200: Accepts a sort_by query and responds accordingly', () => {
      return request(app)
        .get('/api/users/icellusedkars/comments?sort_by=votes')
        .expect(200)
        .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy('votes',{descending:true})
      })
    })
    test('GET 200: Accepts an order query and responds accordingly', () => {
      return request(app)
        .get('/api/users/icellusedkars/comments?order=asc')
        .expect(200)
        .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy('created_at')
      })
    })
    test('GET 400: Returns bad request if order is not asc or desc', () => {
      return request(app)
        .get("/api/users/icellusedkars/comments?order=incorrect")
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    })
    test('GET 400: Returns bad request if sort_by is not a valid column', () => {
      return request(app)
        .get('/api/users/icellusedkars/comments?sort_by=not_a_column')
        .expect(400)
        .then(({ body: { msg } }) => {
        expect(msg).toBe('Bad request')
      })
    })
    test("GET 400: Returns bad request when limit provided is not a number", () => {
      return request(app)
        .get(
          "/api/users/icellusedkars/comments?limit=45;SELECT * FROM articles;"
        )
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 400: Returns bad request when page provided is not a number", () => {
      return request(app)
        .get("/api/users/icellusedkars/comments?p=5;SELECT * FROM articles;")
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Bad request");
        });
    });
    test("GET 404: Returns username not found if no such article exists", () => {
      return request(app)
        .get("/api/users/not_a_user/comments")
        .expect(404)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("Username not found");
        });
    });
  });
});
