const express = require('express');
const axios = require('axios');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor, ConsoleSpanExporter, BatchSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');

const app = express();
const port = 8080;

// Create and configure the tracer provider
const tracerProvider = new NodeTracerProvider();
tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
tracerProvider.register();

// Set up Jaeger exporter
const jaegerExporter = new JaegerExporter({
  serviceName: 'microservice-consumer',
  host: 'localhost',
  port: 6831,
});

// Register the exporter
tracerProvider.addSpanProcessor(new BatchSpanProcessor(jaegerExporter));
tracerProvider.register();

// Create an instance of the HTTP client
const httpClient = axios.create();

// Define the HTTP handler for the /check-service endpoint
app.get('/check-service', async (req, res) => {
  const tracer = tracerProvider.getTracer('microservice-consumer');
  const span = tracer.startSpan('check-service');

  try {
    const response = await httpClient.get('http://serviceb:8080/health');
    const serviceBStatus = response.data.status;

    span.addEvent('Service B health check', { status: serviceBStatus });

    if (serviceBStatus === 'ok') {
      res.send('Service B healthy');
    } else {
      res.send('Service B not available');
    }
  } catch (error) {
    span.addEvent('Service B health check failed');
    console.error(error);
    res.status(500).send('Internal Server Error');
  } finally {
    span.end();
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
