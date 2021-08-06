const jsonServer = require("json-server");
const server = jsonServer.create();

const clientControllers = require("../controllers/clients");

server.post("/clients", clientControllers.createNewClient);

module.exports = server;
