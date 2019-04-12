const errors = [
  { code: 400, type: 'badRequest' },
  { code: 401, type: 'unauthorized' },
  { code: 404, type: 'notFound' },
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
    error.inner = inner
    return error
  }
}

module.exports.propagate = (msg, inner, targetStrategy) => {
  const type = errorsByCode[inner.statusCode]
  const func = targetStrategy[type]
  return func ? func(msg, inner) : module.exports.badImplementation(msg, inner)
}
