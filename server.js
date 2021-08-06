const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("./db.json");
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

const customerRoutes = require("./routes/customers");
const clientRoutes = require("./routes/clients");
const invoiceRoutes = require("./routes/invoices");

server.use(middlewares);
server.use(jsonServer.bodyParser);

/*
 * NextPay Customer's Endpoints
 * ============================
 */

server.use("/nextpay", customerRoutes);
server.use("/nextpay", clientRoutes);
server.use("/nextpay", invoiceRoutes);

// unknown routes
server.use((req, res) => {
  throw new Error("Could not find this route.");
});

server.use(router);
server.listen(port);
