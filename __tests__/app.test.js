const request = require("supertest");
const app = require("../db/app");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const endpoints = require('../endpoints.json')

afterAll(() => {
    db.end()
})

beforeEach(() => {
    return seed(data)
})

describe('Error handling', () => {
    test('404 Not found: Responds appropriately when endpoint does not exist', () => {
        return request(app)
            .get('/api/does-not-exist')
            .expect(404)
            .then(({ body: { msg } }) => {
            expect(msg).toBe('Path not found')
        })
    })
})
describe('/api/topics', () => { 
    describe('GET', () => {
        test('GET 200: Responds with an array of topic objects each containing a slug and description key', () => {
            return request(app)
                .get('/api/topics')
                .expect(200)
                .then(({ body: { topics } }) => {
                    expect(topics.length).toBe(3)
                    topics.forEach((topic) => {
                        expect(typeof topic.description).toBe('string')
                        expect(typeof topic.slug).toBe('string')
                    })
            })
        })
    })
})
describe('/api', () => {
    test('GET 200: Responds with enpoints.json file', () => {
        return request(app)
            .get('/api')
            .expect(200)
            .then(({ body }) => {
            expect(body).toEqual(endpoints)
        })
    })
})
describe('/api/articles/:article_id', () => {
    describe('GET', () => {
        test('GET 200: Responds with an article object with the correct keys', () => {
            return request(app)
                .get('/api/articles/1')
                .expect(200)
                .then(({ body: { article } }) => {
                    expect(article.author).toBe("butter_bridge")
                    expect(article.title).toBe("Living in the shadow of a great man")
                    expect(article.article_id).toBe(1)
                    expect(article.body).toBe("I find this existence challenging")
                    expect(article.topic).toBe('mitch')
                    expect(article.created_at).toBe("2020-07-09T20:11:00.000Z")
                    expect(article.votes).toBe(100)
                    expect(article.article_img_url).toBe("https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700")
            })
        })
        test('GET 404: Responds with article not found when passed an article_id with no corresponding article', () => {
            return request(app)
                .get('/api/articles/100')
                .expect(404)
                .then(({ body: { msg } }) => {
                expect(msg).toBe('Article not found')
            })
        })
        test('GET 400: Responds with bad request if passed an article_id value which is not an integer', () => {
            return request(app)
                .get('/api/articles/not-a-number')
                .expect(400)
                .then(({ body: { msg } }) => {
                expect(msg).toBe('Bad request')
            })
        })
    })
})