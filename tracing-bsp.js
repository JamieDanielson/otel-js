
const process = require('process');
const { Metadata, credentials } = require("@grpc/grpc-js");

const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-grpc");

// use tracerprovider instead of sdk
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');

const metadata = new Metadata()
metadata.set('x-honeycomb-team', process.env.HONEYCOMB_API_KEY);
metadata.set('x-honeycomb-dataset', 'otel-node');

// ConsoleSpanExporter for testing, OTLPTraceExporter for Honeycomb
const traceExporter = new OTLPTraceExporter({
  url: 'grpc://api.honeycomb.io:443/',
  credentials: credentials.createSsl(),
  metadata
});
// const traceExporter = new ConsoleSpanExporter();

// using NodeTracerProvider instead of NodeSDK
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'otel-node',
  }),
});

// SimpleSpanProcessor for testing, BatchSpanProcessor for Honeycomb
// provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
provider.register();

registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()]
});
