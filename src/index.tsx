import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Testing from "./testing.js"

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Testing />
  </React.StrictMode>
);
