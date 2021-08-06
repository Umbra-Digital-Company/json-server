const jsonServer = require("json-server");
const server = jsonServer.create();

const invoiceControllers = require("../controllers/invoices");

server.get("/invoices", invoiceControllers.getAllInvoice);

server.get("/invoices/:id", invoiceControllers.getInvoiceById);

server.post("/invoices", invoiceControllers.createNewInvoice);

server.put("/invoices/:id", invoiceControllers.updateInvoiceById);

server.patch("/invoices/:id", invoiceControllers.updateInvoiceStatusById);

server.patch("/invoices/:id/notes", invoiceControllers.updateInvoiceNotesById);

server.delete("/invoices/:id", invoiceControllers.deleteInvoiceById);

module.exports = server;
