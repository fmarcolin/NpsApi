import request from 'supertest';
import { getConnection } from 'typeorm';
import { app } from '../app';

import createConnection from '../database';


describe("Surveys", () => {
    beforeAll(async () => {
        const connection = await createConnection();
        await connection.runMigrations();
    })

    afterAll(async () => {
        const connection = getConnection();
        await connection.dropDatabase();
        await connection.close();
    })

    it("should be able to create a new survey", async () => {
        const response = await request(app)
        .post("/surveys")
        .send({
            title: "test",
            description: "test description"
        });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("id");
    })

    it("should be able to get all surveys", async () => {
        await request(app)
        .post("/surveys")
        .send({
            title: "test 2",
            description: "test description 2"
        });

        const response = await request(app).get("/surveys");

        expect(response.body.length).toBe(2);
    })
    
})