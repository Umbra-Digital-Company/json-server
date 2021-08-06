const jsonServer = require("json-server");
const router = jsonServer.router("./db.json");
const db = router.db;

// ============================== POST

const createNewClient = (req, res) => {
  // Save data
  const table = db.get("clients");
  table.push(req.body).write();

  res.json(200);
};

exports.createNewClient = createNewClient;
