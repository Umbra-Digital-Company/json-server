const jsonServer = require("json-server");
const { v4: uuidv4 } = require("uuid");
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
  const customers = db.get("customers").value();

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
  const customerId = uuidv4();
  const customerData = req.body;
  customerData.id = customerId;

  insert(db, "customers", customerData); // Add a post

  res.json(200);

  /**
   * Checks whether the id of the new data already exists in the DB
   * @param {*} db - DB object
   * @param {String} collection - Name of the array / collection in the DB / JSON file
   * @param {*} data - New record
   */
  function insert(db, collection, data) {
    const table = db.get(collection);
    table.push(data).write();
  }
});

server.patch("/nextpay/customers/:id", (req, res) => {
  const customerId = req.params.id;
  const { client_id } = req.query;
  const filter = { id: customerId, client: client_id };

  // Verify client authorization
  const customer = db.get("customers").find({ id: customerId }).value();

  if (client_id !== customer.client) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  update(db, "customers", filter, req.body);

  res.json(200);

  /**
   * Checks whether the id of the new data already exists in the DB
   * @param {*} db - DB object
   * @param {String} collection - Name of the array / collection in the DB / JSON file
   * @param {*} data - Updated record
   * @param {*} filter - Filter record
   */
  function update(db, collection, filter, data) {
    const table = db.get(collection);
    table
      .find(filter)
      .assign(_.omit(data, ["id"]))
      .write();
  }
});

server.delete("/nextpay/customers/:id", (req, res) => {
  const customerId = req.params.id;
  const { client_id } = req.query;

  // Verify client authorization
  const customer = db.get("customers").find({ id: customerId }).value();

  if (client_id !== customer.client) {
    return res.status(401).json({ message: "Unauthorized request" });
  }
  remove(db, "customers", customerId);

  res.json(200);

  /**
   * Checks whether the id of the new data already exists in the DB
   * @param {*} db - DB object
   * @param {String} collection - Name of the array / collection in the DB / JSON file
   * @param {*} id - Remove by ID
   */
  function remove(db, collection, id) {
    const table = db.get(collection).valueOf();
    db.set(
      collection,
      table.filter((elem) => elem.id !== id && elem.client === client_id)
    ).write();
  }
});

// unknown routes
server.use((req, res) => {
  throw new Error("Could not find this route.");
});

server.use(router);
server.listen(port);
