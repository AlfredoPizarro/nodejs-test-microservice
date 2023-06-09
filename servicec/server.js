const express = require('express');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const app = express();
const port = 8080;

// Create and configure the tracer provider
const tracerProvider = new NodeTracerProvider();
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
tracerProvider.register();

// Set up Jaeger exporter
const jaegerExporter = new JaegerExporter({
  serviceName: 'servicec',
  host: 'localhost',
  port: 6831,
});

// Register the exporter
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
tracerProvider.register();

// Define the HTTP handler for the /health endpoint
app.get('/Path1/request/servicec', (req, res) => {
  const tracer = tracerProvider.getTracer('servicec');
  const span = tracer.startSpan('health');
  
  // Do additional processing or operations here if needed
  
  span.end();

  const response = { service: 'service-C' };
  res.json(response);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
