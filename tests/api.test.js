const fs = require("fs");
const os = require("os");
const path = require("path");
const request = require("supertest");

let app;
let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "ftf-test-"));
  process.env.FTF_DATA_DIR = tmpDir;
  jest.resetModules();
  app = require("../src/app").createApp();
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.FTF_DATA_DIR;
});

describe("Fish the Flats API", () => {
  test("health check responds ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("starts with no catches", async () => {
    const res = await request(app).get("/api/catches");
    expect(res.status).toBe(200);
    expect(res.body.catches).toEqual([]);
  });

  test("creates a catch and lists it", async () => {
    const create = await request(app)
      .post("/api/catches")
      .send({ species: "Bonefish", lengthIn: 24.5, spot: "Islamorada", angler: "Casey" });
    expect(create.status).toBe(201);
    expect(create.body.catch).toMatchObject({
      species: "Bonefish",
      lengthIn: 24.5,
      spot: "Islamorada",
      angler: "Casey",
    });
    expect(create.body.catch.id).toBeTruthy();

    const list = await request(app).get("/api/catches");
    expect(list.body.catches).toHaveLength(1);
  });

  test("rejects an invalid species", async () => {
    const res = await request(app)
      .post("/api/catches")
      .send({ species: "Shark", lengthIn: 40, spot: "Key West" });
    expect(res.status).toBe(400);
  });

  test("rejects a non-positive length", async () => {
    const res = await request(app)
      .post("/api/catches")
      .send({ species: "Permit", lengthIn: 0, spot: "Marquesas" });
    expect(res.status).toBe(400);
  });

  test("defaults angler to Anonymous", async () => {
    const res = await request(app)
      .post("/api/catches")
      .send({ species: "Tarpon", lengthIn: 60, spot: "Boca Grande" });
    expect(res.body.catch.angler).toBe("Anonymous");
  });

  test("computes stats", async () => {
    await request(app).post("/api/catches").send({ species: "Redfish", lengthIn: 20, spot: "Mosquito Lagoon" });
    await request(app).post("/api/catches").send({ species: "Redfish", lengthIn: 28, spot: "Mosquito Lagoon" });
    await request(app).post("/api/catches").send({ species: "Snook", lengthIn: 32, spot: "Tampa Bay" });

    const res = await request(app).get("/api/stats");
    expect(res.body.total).toBe(3);
    expect(res.body.bySpecies.Redfish).toBe(2);
    expect(res.body.longest.lengthIn).toBe(32);
    expect(res.body.longest.species).toBe("Snook");
  });

  test("deletes a catch", async () => {
    const create = await request(app)
      .post("/api/catches")
      .send({ species: "Trout", lengthIn: 18, spot: "Laguna Madre" });
    const id = create.body.catch.id;

    const del = await request(app).delete(`/api/catches/${id}`);
    expect(del.status).toBe(204);

    const list = await request(app).get("/api/catches");
    expect(list.body.catches).toHaveLength(0);
  });

  test("returns 404 deleting an unknown catch", async () => {
    const res = await request(app).delete("/api/catches/does-not-exist");
    expect(res.status).toBe(404);
  });
});
