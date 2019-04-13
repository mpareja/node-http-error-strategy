const HttpErrorStrategy = require('../')

const A_DESCRIPTION = 'my description'
const A_PARENT_DESCRIPTION = 'parent description'

;[
  { code: 400, type: 'badRequest' },
  { code: 403, type: 'forbidden' },
  { code: 404, type: 'notFound' },
  { code: 412, type: 'preconditionFailed' },
  { code: 500, type: 'badImplementation' },
  { code: 501, type: 'notImplemented' },
  { code: 503, type: 'unavailable' }
].forEach(testError)

describe('propagate status information from inner HTTP errors', () => {
  const inner = HttpErrorStrategy.unavailable(A_DESCRIPTION)
  const outer = HttpErrorStrategy.propagate(A_PARENT_DESCRIPTION, inner, HttpErrorStrategy)

  it('outer error has description', () => {
    expect(outer).toEqual(new Error(A_PARENT_DESCRIPTION))
  })

  it('outer error includes the inner status code', () => {
    expect(outer.statusCode).toEqual(inner.statusCode)
  })

  it('outer error includes the inner error', () => {
    expect(outer.inner).toBe(inner)
  })

  describe('when propagating HTTP errors to other error strategies', () => {
    const TargetErrorStrategy = {
      unavailable: (msg, inner) => {
        const error = new Error(msg)
        error.inner = inner
        error.otherStatusField = 'UNAVAILABLE'
        return error
      }
    }
    const httpError = HttpErrorStrategy.unavailable(A_DESCRIPTION)
    const targetError = HttpErrorStrategy.propagate(A_PARENT_DESCRIPTION, httpError, TargetErrorStrategy)

    it('outer error has description', () => {
      expect(targetError).toEqual(new Error(A_PARENT_DESCRIPTION))
    })

    it('outer error does NOT include the HTTP status code field', () => {
      expect(targetError.statusCode).toBe(undefined)
    })

    it('outer error includes the target strategy\'s error details', () => {
      expect(targetError.otherStatusField).toBe('UNAVAILABLE')
    })

    it('outer error includes the inner error', () => {
      expect(targetError.inner).toBe(httpError)
    })
  })

  it('propagates non-HTTP errors without specifying a status code', () => {
    const nonHttpError = new Error(A_DESCRIPTION)
    const outer = HttpErrorStrategy.propagate(A_PARENT_DESCRIPTION, nonHttpError, HttpErrorStrategy)

    expect(outer).toEqual(new Error(A_PARENT_DESCRIPTION))
  })
})

function testError ({ type, code }) {
  describe(type, () => {
    it('has description', () => {
      const error = HttpErrorStrategy[type](A_DESCRIPTION)
      expect(error).toEqual(new Error(A_DESCRIPTION))
    })

    it(`has a status code of ${code}`, () => {
      const error = HttpErrorStrategy[type]()
      expect(error.statusCode).toBe(code)
    })

    it('includes inner error', () => {
      const inner = new Error('bogus')
      const error = HttpErrorStrategy[type](A_DESCRIPTION, inner)
      expect(error.inner).toBe(inner)
    })
  })
}
