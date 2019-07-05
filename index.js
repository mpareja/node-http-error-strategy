const errors = [
  { code: 400, type: 'badRequest' },
  { code: 403, type: 'forbidden' },
  { code: 404, type: 'notFound' },
  { code: 412, type: 'preconditionFailed' },
  { code: 500, type: 'badImplementation' },
  { code: 501, type: 'notImplemented' },
  { code: 503, type: 'unavailable' }
]

const errorsByCode = errors.reduce((acc, current) => {
  acc[current.code] = current.type
  return acc
}, {})

for (let { type, code } of errors) {
  module.exports[type] = (msg, inner) => {
    const error = new Error(msg)
    error.statusCode = code
    if (inner) {
      error.inner = inner
    }
    return error
  }
}

module.exports.propagate = (msg, inner, targetStrategy) => {
  const type = errorsByCode[inner.statusCode]
  const func = targetStrategy[type]
  return func ? func(msg, inner) : module.exports.badImplementation(msg, inner)
}
