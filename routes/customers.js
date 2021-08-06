const jsonServer = require("json-server");
const server = jsonServer.create();

const customerControllers = require("../controllers/customers");

server.get("/customers", customerControllers.getAllCustomers);

server.get("/customers/:id", customerControllers.getCustomerById);

server.post("/customers", customerControllers.createNewCustomer);

server.put("/customers/:id", customerControllers.updateCustomerById);

server.delete("/customers/:id", customerControllers.deleteCustomerById);

module.exports = server;
