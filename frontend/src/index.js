import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import * as serviceWorker from "./serviceWorker";

// 1. Import drizzle, drizzle-react, and your contract artifacts.
import { Drizzle, generateStore } from "drizzle";
import { DrizzleContext } from "drizzle-react";
import StarNotary from "./contracts/StarNotary.json";

// 2. Setup the drizzle instance.
const options = {
  contracts: [StarNotary],
  events: {
    StarNotary: ["Transfer"]
  }
};
const drizzleStore = generateStore(options);
const drizzle = new Drizzle(options, drizzleStore);

ReactDOM.render(
  <DrizzleContext.Provider drizzle={drizzle}>
    <App />
  </DrizzleContext.Provider>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
