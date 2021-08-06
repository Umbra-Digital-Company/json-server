const { v4: uuidv4 } = require("uuid");
const _ = require("lodash");
const jsonServer = require("json-server");
const router = jsonServer.router("./db.json");
const db = router.db;

// ============================== GET

const getAllInvoice = (req, res) => {
  const { client_id } = req.query;
  const invoices = db.get("invoices").value();

  res.json(invoices.filter((invoice) => invoice.client === client_id));
};

const getInvoiceById = (req, res) => {
  const { client_id } = req.query;
  const invoice = db.get("invoices").find({ id: req.params.id }).value();

  if (!invoice) {
    return res.json({
      error: true,
      statusCode: 404,
      message: "Invoice not found with the provided ID",
    });
  }

  if (invoice.client !== client_id) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  res.json(invoice);
};

// ============================== POST

const createNewInvoice = (req, res) => {
  // Save customer first if its new data
  let newCustomerId;
  if (req.body.customer.id === "add") {
    const customerId = uuidv4();
    const clientId = req.body.client;
    const customerData = {
      client: clientId,
      customer: req.body.customer.name,
      emailAddress: req.body.customer.emailAddress,
      id: customerId,
    };
    customerData.id = customerId;

    // Save customer data
    const customerTable = db.get("customers");
    customerTable.push(customerData).write();

    newCustomerId = customerData.id;
  }

  // Save invoice data
  req.body.id = uuidv4();
  req.body.customer.id = newCustomerId || req.body.customer.id;
  req.body.status = {
    draft: true,
    published: false,
    open: false,
    void: false,
    remarks: null,
  };
  const invoiceTable = db.get("invoices");
  invoiceTable.push(req.body).write();

  res.json(200);
};

// ============================== PUT

const updateInvoiceById = (req, res) => {
  const invociceId = req.params.id;
  const { client_id } = req.query;
  const filter = { id: invociceId, client: client_id };

  let newCustomerId;
  if (req.body.customer.id === "add") {
    const customerId = uuidv4();
    const clientId = req.body.client;
    const customerData = {
      client: clientId,
      customer: req.body.customer.name,
      emailAddress: req.body.customer.emailAddress,
      id: customerId,
    };
    customerData.id = customerId;

    // Save customer data
    const customerTable = db.get("customers");
    customerTable.push(customerData).write();

    newCustomerId = customerData.id;
  }

  // Update data
  req.body.id = uuidv4();
  req.body.customer.id = newCustomerId || req.body.customer.id;
  const invoiceTable = db.get("invoices");
  invoiceTable
    .find(filter)
    .assign(_.omit(req.body, ["id"]))
    .write();

  res.json(200);
};

// ============================== PATCH

const updateInvoiceStatusById = (req, res) => {
  const invociceId = req.params.id;
  const { client_id } = req.query;
  const filter = { id: invociceId, client: client_id };

  // Grab original data
  const origin = db.get("invoices").find({ id: req.params.id }).value();

  const table = db.get("invoices");
  table.find(filter).assign(_.merge(origin, req.body)).write();

  res.json(200);
};

const updateInvoiceNotesById = (req, res) => {
  const invociceId = req.params.id;
  const { client_id } = req.query;
  const filter = { id: invociceId, client: client_id };

  // Grab original data
  const origin = db.get("invoices").find({ id: req.params.id }).value();

  const table = db.get("invoices");
  table.find(filter).assign(_.merge(origin, req.body)).write();

  res.json(200);
};

// ============================== DELETE

const deleteInvoiceById = (req, res) => {
  const invoiceId = req.params.id;
  const { client_id } = req.query;

  // Verify client authorization
  const invoice = db.get("invoices").find({ id: invoiceId }).value();

  if (client_id !== invoice.client) {
    return res.status(401).json({ message: "Unauthorized request" });
  }

  // Check if has been published already
  if (!invoice.status.draft) {
    return res
      .status(422)
      .json({ message: "You can't delete publisbhed invoice." });
  }

  // Delete data
  const table = db.get("invoices").valueOf();
  db.set(
    "invoices",
    table.filter((elem) => elem.id !== invoiceId && elem.client === client_id)
  ).write();

  res.json(200);
};

exports.getAllInvoice = getAllInvoice;
exports.getInvoiceById = getInvoiceById;
exports.createNewInvoice = createNewInvoice;
exports.updateInvoiceById = updateInvoiceById;
exports.updateInvoiceStatusById = updateInvoiceStatusById;
exports.updateInvoiceNotesById = updateInvoiceNotesById;
exports.deleteInvoiceById = deleteInvoiceById;
