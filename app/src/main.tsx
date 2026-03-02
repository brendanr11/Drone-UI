import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import BaselineMapApp from "./BaselineMapApp";
import "./styles/globals.css";

const pathname = window.location.pathname.toLowerCase();
const params = new URLSearchParams(window.location.search);
const baselineRequested =
  pathname === "/baseline-map" ||
  params.get("ui")?.toLowerCase() === "baseline";

ReactDOM.createRoot(document.getElementById("root")!).render(
  baselineRequested ? <BaselineMapApp /> : <App />
);
