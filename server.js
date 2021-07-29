const jsonServer = require("json-server");
const server = jsonServer.create();
const _ = require("lodash");
const router = jsonServer.router("./db.json");
const db = router.db;
const middlewares = jsonServer.defaults();
const port = process.env.PORT || 3000;

server.use(middlewares);
server.use(jsonServer.bodyParser);

/*
 * NextPay Customer's Endpoints
 * ============================
 */

server.get("/nextpay/customers", (req, res) => {
  const { client_id } = req.query;
  const customers = db.getState().customers;

  res.json(customers.filter((customer) => customer.client === client_id));
});

server.get("/nextpay/customers/:id", (req, res) => {
  const { client_id } = req.query;
  const customer = db.get("customers").find({ id: req.params.id }).value();

  if (!customer) {
    return res.json({
      error: true,
      statusCode: 404,
      message: "Customer not found with the provided ID",
    });
  }

  if (customer.client !== client_id) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  res.json(customer);
});

server.post("/nextpay/customers", (req, res) => {
  insert(db, "customers", req.body); // Add a post

  res.sendStatus(200);

  /**
   * Checks whether the id of the new data already exists in the DB
   * @param {*} db - DB object
   * @param {String} collection - Name of the array / collection in the DB / JSON file
   * @param {*} data - New record
   */
  function insert(db, collection, data) {
    const table = db.get(collection);
    if (_.isEmpty(table.find(data).value())) {
      table.push(data).write();
    }
  }
});

server.patch("/nextpay/customers/:id", (req, res) => {
  const customerId = req.params.id;
  console.log(req.body);
  const customer = db.get("customers").find({ id: customerId }).value();
  console.log(customer);

  res.json(customer);
});

server.use(router);
server.listen(port);
