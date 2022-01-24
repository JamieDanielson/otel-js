"use strict";
const opentelemetry = require("@opentelemetry/api");

const PORT = process.env.PORT || "8080";
const express = require("express");
const app = express();

app.get("/", (req, res) => {

  const tracer = opentelemetry.trace.getTracer("main-tracer");

  // Create a span. A span must be closed.
  const parentSpan = tracer.startSpan("main");
  for (let i = 0; i < 10; i += 1) {
    doWork(parentSpan);
  }

  /* ... */

  function doWork(parent) {
    // Start another span. In this example, the main function already started a
    // span, so that'll be the parent span, and this will be a child span.
    const ctx = opentelemetry.trace.setSpan(opentelemetry.context.active(), parent);
    const span = tracer.startSpan("doWork", undefined, ctx);

    // simulate some random work.
    for (let i = 0; i <= Math.floor(Math.random() * 40000000); i += 1) {
      // empty
    }

    // Make sure to end this child span! If you don't,
    // it will continue to track work beyond 'doWork'!
    span.end();
  }

  // Be sure to end the parent span.
  parentSpan.end();

  console.log("i'm saying hi!");

  res.send("oh hi!");

});

app.listen(parseInt(PORT, 10), () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
