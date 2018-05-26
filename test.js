'use strict'

const assert = require('assert')
const extract = require('./index')

describe('extract', function () {

  it('extracts file from simple import', function () {
    var test = 'import "./abc.sol";'
    assert.deepEqual(extract(test), ['./abc.sol'])
  })

  it('extracts file from qualified import', function () {
    var test = 'import "./abc.sol" as x;'
    assert.deepEqual(extract(test), ['./abc.sol'])
  })

  it('extracts file from star import', function () {
    var test = 'import * as y from "./abc.sol";'
    assert.deepEqual(extract(test), ['./abc.sol'])
  })

  it('extracts file from destructuring import', function () {
    var test = 'import {a as b, c as d, f} from "./abc.sol";'
    assert.deepEqual(extract(test), ['./abc.sol'])
  })

  it('finds imports within bigger file', function () {
    var test = `
			import "./abc.sol";
			import "./def.sol";
			
			contract test {}
		`
    assert.deepEqual(extract(test), ['./abc.sol', './def.sol'])
  })

  it('finds imports in the same line', function () {
    var test = `
			import "./abc.sol";import "./def.sol";
		`
    assert.deepEqual(extract(test), ['./abc.sol', './def.sol'])
  })

  it('ignores commented out imports', function () {
    var test = `
			import "./abc.sol";
			// import "./def.sol";
			/* import "./def.sol"; */
		`
    assert.deepEqual(extract(test), ['./abc.sol'])
  })

  it('ignores imports within string literals', function () {
    var test = `
      contract test {
        string a = 'import "./abc.sol";';
      }
		`
    assert.deepEqual(extract(test), [])
  })

  it('handles escapes correctly', function () {
    var test = `
      contract test {
        string a = '\\'import "./abc.sol";';
      }
		`
    assert.deepEqual(extract(test), [])
  })
})
