const request = require("supertest");
const app = require("../db/app");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");

afterAll(() => {
    db.end()
})

beforeEach(() => {
    return seed(data)
})

describe('/api/topics', () => {
    test('404 Not found: Responds appropriately when endpoint does not exist', () => {
        return request(app)
            .get('/api/does-not-exist')
            .expect(404)
            .then(({ body: { msg } }) => {
            expect(msg).toBe('Path not found')
        })
    })
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