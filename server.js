const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

const schema = buildSchema(`
  type Address {
    addressline1: String
    addressline2: String
    city: String
    stateOrProvince: String
    postalcode: String
    notes: String
    unit: String
    country: String
  }

  input AddressInput {
    addressline1: String
    addressline2: String
    city: String
    stateOrProvince: String
    postalcode: String
    notes: String
    unit: String
    country: String
  }

  type Customer {
    name: String
    uuid: String
    businessAddress: Address
    mobileNumber: String
    email: String
    contactPerson: String
    created_at: String
    updated_at: String
  }

  input CustomerInput {
    name: String!
    email: String!
    mobileNumber: String
    contactPerson: String
    businessAddressInput: AddressInput
  }

  input EditCustomerInput {
    name: String!
    email: String!
    mobileNumber: String
    contactPerson: String
    businessAddressInput: AddressInput
    uuid: String
  }

  type Query {
    findOneCustomer(uuid: String!): Customer
  }

  type Mutation {
    createCustomer(customerInput: CustomerInput, addressInput: AddressInput): Customer
    editCustomer(customerInput: EditCustomerInput): Customer
    deleteCustomer(uuid: String!): Customer
  }
`);

const app = express();

app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

app.listen(3000, () => {
  console.log("Server is running on port 3000...");
});
