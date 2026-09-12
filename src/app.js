const path = require("path");
const crypto = require("crypto");
const express = require("express");
const store = require("./store");

const SPECIES = [
  "Bonefish",
  "Permit",
  "Tarpon",
  "Redfish",
  "Snook",
  "Trout",
  "Barracuda",
  "Other",
];

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "..", "public")));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  app.get("/api/species", (_req, res) => {
    res.json({ species: SPECIES });
  });

  app.get("/api/catches", (_req, res) => {
    const catches = store.readAll().sort((a, b) => b.caughtAt.localeCompare(a.caughtAt));
    res.json({ catches });
  });

  app.get("/api/stats", (_req, res) => {
    const catches = store.readAll();
    const bySpecies = {};
    let longest = null;
    for (const c of catches) {
      bySpecies[c.species] = (bySpecies[c.species] || 0) + 1;
      if (longest === null || c.lengthIn > longest.lengthIn) {
        longest = c;
      }
    }
    res.json({ total: catches.length, bySpecies, longest });
  });

  app.post("/api/catches", (req, res) => {
    const { species, lengthIn, spot, angler } = req.body || {};

    if (!species || !SPECIES.includes(species)) {
      return res.status(400).json({ error: "A valid species is required." });
    }
    const length = Number(lengthIn);
    if (!Number.isFinite(length) || length <= 0 || length > 300) {
      return res.status(400).json({ error: "lengthIn must be a number between 0 and 300." });
    }
    if (!spot || typeof spot !== "string" || spot.trim().length === 0) {
      return res.status(400).json({ error: "A fishing spot is required." });
    }

    const record = {
      id: crypto.randomUUID(),
      species,
      lengthIn: Math.round(length * 10) / 10,
      spot: spot.trim(),
      angler: (angler && String(angler).trim()) || "Anonymous",
      caughtAt: new Date().toISOString(),
    };

    const catches = store.readAll();
    catches.push(record);
    store.writeAll(catches);

    res.status(201).json({ catch: record });
  });

  app.delete("/api/catches/:id", (req, res) => {
    const catches = store.readAll();
    const next = catches.filter((c) => c.id !== req.params.id);
    if (next.length === catches.length) {
      return res.status(404).json({ error: "Catch not found." });
    }
    store.writeAll(next);
    res.status(204).end();
  });

  return app;
}

module.exports = { createApp, SPECIES };
