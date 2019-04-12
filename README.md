# http-error-strategy

An HTTP implementation of the [error strategy interface](#error-strategy-interface).

## ErrorStrategy Interface

```typescript
interface ErrorStrategy {
  badRequest: (message: string, innerError?: Error): Error,
  notFound: (message: string, innerError?: Error): Error,
  notImplemented: (message: string, innerError?: Error): Error,
  unauthorized: (message: string, innerError?: Error): Error,
  unavailable: (message: string, innerError?: Error): Error,

  propagate: (message: string, innerError: Error, innerErrorStrategy: ErrorStrategy): Error
}
```

### propagateError

Allows one to wrap an error with more context while preserving the error type. For HTTP, the Status Code will be copied to the new error message. It can be desireable to propagate errors across technologies. Example:

You are trying to respond to HTTP request and need to contact a gRPC API. If you want to propagate the gRPC errors as HTTP error, simply do the following:

```javascript
const { propagate } = require('http-error-strategy')
const GrpcErrorStrategy = require('grpc-error-strategy')

try {
  subOperationOverGrpc()
} catch (e) {
  throw propagate('unable to do overall operation', e, GrpcErrorStrategy)
}
```
