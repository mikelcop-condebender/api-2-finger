import { defineFeature, loadFeature } from "jest-cucumber";
import buildApp from "../../src/server";

const feature = loadFeature("./test/hello/index.feature");
const app = buildApp();

let response: any;

defineFeature(feature, (test) => {
  test("Get hello message", ({ when, then }) => {
    when("I GET /", async () => {
      response = await app.inject({
        method: "GET",
        url: "/",
      });
    });

    then("the response should be 200", () => {
      expect(response.statusCode).toBe(200);
    });

    then('the message should be "Hello, JM"', () => {
      const body = JSON.parse(response.body);
      expect(body.message).toBe("Hello, JM!");
    });
  });
});
