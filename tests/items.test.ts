import supertest from "supertest";
import app from "../src/app";
import { prisma } from "../src/database";
import { itemFactory } from "./factories/itemFactory";

beforeEach(async () => {
	await prisma.$executeRaw`TRUNCATE TABLE "items"`;
});

//========================================
describe("Testa POST /items ", () => {
	it("Deve retornar 201, se cadastrado um item no formato correto", async () => {
		const item = await itemFactory();

		const test = await supertest(app).post("/items").send(item);

		expect(test.status).toBe(201);
	});

	it("Deve retornar 409, ao tentar cadastrar um item que exista", async () => {
		const item = await itemFactory();

		const test = await supertest(app).post("/items").send(item);
		const duplicateTest = await supertest(app).post("/items").send(item);

		expect(duplicateTest.status).toBe(409);
	});
});

//========================================
describe("Testa GET /items ", () => {
	it("Deve retornar status 200 e o body no formato de Array", async () => {
		const test = await supertest(app).get("/items").send();

		expect(test.status).toBe(200);
		expect(test.body).toBeInstanceOf(Array);
	});
});

//========================================
describe("Testa GET /items/:id ", () => {
	it("Deve retornar status 200 e um objeto igual ao item cadastrado", async () => {
		const item = await itemFactory();

		const insertTestItem = await supertest(app).post("/items").send(item);

		const insertedItem = await prisma.items.findUnique({
			where: { title: item.title },
		});

		const test = await supertest(app).get(`/items/${insertedItem.id}`);

		expect(test).not.toBeNull();
		expect(test.status).toBe(200);
	});

	it("Deve retornar status 404 caso não exista um item com esse id", async () => {
		const test = await supertest(app).get(`/items/1`);

		expect(test.status).toBe(404);
	});
});

afterAll(async () => {
	await prisma.$disconnect();
});
