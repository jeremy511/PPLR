import request from "supertest";
import { app } from "../src/index.js";

describe("GET /", () => {
  it("should return 200 and welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain("Buenos Dias");
  });
});

describe("API Health Check", () => {
  it("should handle 404 for unknown routes", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.statusCode).toEqual(404); // Assuming errorHandler returns 404 or similar, checking behavior
    // If you don't have a specific 404 handler that sets status, express sends HTML 404.
    // Let's verify what the error handler does.
  });
});
