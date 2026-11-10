const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

if (endpoint) {
  const { NodeSDK } = require("@opentelemetry/sdk-node");
  const {
    OTLPTraceExporter,
  } = require("@opentelemetry/exporter-trace-otlp-http");
  const {
    getNodeAutoInstrumentations,
  } = require("@opentelemetry/auto-instrumentations-node");
  const { resourceFromAttributes } = require("@opentelemetry/resources");
  const {
    ATTR_SERVICE_NAME,
  } = require("@opentelemetry/semantic-conventions");

  const serviceName = process.env.OTEL_SERVICE_NAME || "warroom-server";
  const traceUrl = endpoint.endsWith("/v1/traces")
    ? endpoint
    : `${endpoint.replace(/\/$/, "")}/v1/traces`;

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    traceExporter: new OTLPTraceExporter({ url: traceUrl }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
}
