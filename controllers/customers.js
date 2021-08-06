const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");
const jsonServer = require("json-server");
const router = jsonServer.router("./db.json");
const db = router.db;

// ============================== GET

const getAllCustomers = (req, res) => {
  const { client_id } = req.query;
  const customers = db.get("customers").value();

  res.json(customers.filter((customer) => customer.client === client_id));
};

const getCustomerById = (req, res) => {
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
};

// ============================== POST

const createNewCustomer = (req, res) => {
  const customerId = uuidv4();
  const customerData = req.body;
  customerData.id = customerId;

  // Save data
  const table = db.get("customers");
  table.push(customerData).write();

  res.json(customerData);
};

// ============================== PATCH

const updateCustomerById = (req, res) => {
  const customerId = req.params.id;
  const { client_id } = req.query;
  const filter = { id: customerId, client: client_id };

  // Verify client authorization
  const customer = db.get("customers").find({ id: customerId }).value();

  if (client_id !== customer.client) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  // Update data
  const table = db.get("customers");
  table
    .find(filter)
    .assign(_.omit(req.body, ["id"]))
    .write();

  res.json(200);
};

// ============================== DELETE

const deleteCustomerById = (req, res) => {
  const customerId = req.params.id;
  const { client_id } = req.query;

  // Verify client authorization
  const customer = db.get("customers").find({ id: customerId }).value();

  if (client_id !== customer.client) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  // Delete data
  const table = db.get("customers").valueOf();
  db.set(
    "customers",
    table.filter((elem) => elem.id !== customerId && elem.client === client_id)
  ).write();

  res.json(200);
};

exports.getAllCustomers = getAllCustomers;
exports.getCustomerById = getCustomerById;
exports.createNewCustomer = createNewCustomer;
exports.updateCustomerById = updateCustomerById;
exports.deleteCustomerById = deleteCustomerById;
