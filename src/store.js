const fs = require("fs");
const path = require("path");

const DATA_DIR = process.env.FTF_DATA_DIR
  ? path.resolve(process.env.FTF_DATA_DIR)
  : path.join(__dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "catches.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

function readAll() {
  ensureStore();
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(records) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2));
}

module.exports = { readAll, writeAll, DATA_FILE };
