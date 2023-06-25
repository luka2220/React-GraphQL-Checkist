import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// configuring apollo for graphql
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

// core part of apollo (client)
const client = new ApolloClient({
  uri: "https://destined-boxer-44.hasura.app/v1/graphql",
  cache: new InMemoryCache(),
  headers: {
    "content-type": "application/json",
    "x-hasura-admin-secret": process.env.REACT_APP_API_KEY,
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
