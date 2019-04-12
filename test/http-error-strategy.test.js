const ErrorStrategy = require('../')

const A_DESCRIPTION = 'my description'
const A_PARENT_DESCRIPTION = 'parent description'

;[
  { code: 400, type: 'badRequest' },
  { code: 401, type: 'unauthorized' },
  { code: 404, type: 'notFound' },
  { code: 501, type: 'notImplemented' },
  { code: 503, type: 'unavailable' }
].forEach(testError)

describe('propagate', () => {
  const { propagate } = ErrorStrategy
  const inner = ErrorStrategy.unavailable(A_DESCRIPTION)
  const outer = propagate(A_PARENT_DESCRIPTION, inner, ErrorStrategy)

  it('has description', () => {
    expect(outer).toEqual(new Error(A_PARENT_DESCRIPTION))
  })

  it('includes the inner status code', () => {
    expect(outer.statusCode).toEqual(inner.statusCode)
  })

  it('supports other error strategies', () => {
    const OtherErrorStrategy = {
      unavailable: (msg, inner) => {
        const error = new Error(msg)
        error.inner = inner
        error.otherStatusField = 'UNAVAILABLE'
        return error
      }
    }
    const outer = propagate(A_PARENT_DESCRIPTION, inner, OtherErrorStrategy)
    expect(outer).toEqual(new Error(A_PARENT_DESCRIPTION))
    expect(outer.statusCode).toBe(undefined)
    expect(outer.otherStatusField).toBe('UNAVAILABLE')
    expect(outer.inner).toBe(inner)
  })
})

function testError ({ type, code }) {
  describe(type, () => {
    it('has description', () => {
      const error = ErrorStrategy[type](A_DESCRIPTION)
      expect(error).toEqual(new Error(A_DESCRIPTION))
    })

    it(`has a status code of ${code}`, () => {
      const error = ErrorStrategy[type]()
      expect(error.statusCode).toBe(code)
    })

    it('includes inner error', () => {
      const inner = new Error('bogus')
      const error = ErrorStrategy[type](A_DESCRIPTION, inner)
      expect(error.inner).toBe(inner)
    })
  })
}
