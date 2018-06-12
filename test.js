'use strict'

const assert = require('assert')
const extract = require('./index')

describe('extract', function () {

  describe('extracts file from simple import', function () {

    it('should work with double quotes', function () {
      var test = 'import "./abc.sol";'
      assert.deepEqual(extract(test), ['./abc.sol'])
    })

    it('should work with single quotes', function () {
      var test = 'import \'./abc.sol\';'
      assert.deepEqual(extract(test), ['./abc.sol'])
    })
  })

  describe('extracts file from qualified import', function () {

    it('should work with double quotes', function () {
      var test = 'import "./abc.sol" as x;'
      assert.deepEqual(extract(test), ['./abc.sol'])
    })

    it('should work with single quotes', function () {
      var test = 'import \'./abc.sol\' as x;'
      assert.deepEqual(extract(test), ['./abc.sol'])
    })

  })

  describe('extracts file from star import', function () {
    it('should work with double quotes', function () {
      var test = 'import * as y from "./abc.sol";'
      assert.deepEqual(extract(test), ['./abc.sol'])
    })

    it('should work with single quotes', function () {
      var test = 'import * as y from \'./abc.sol\';'
      assert.deepEqual(extract(test), ['./abc.sol'])
    })
  })

  describe('extracts file from destructuring import', function () {
    it('should work with double quotes', function () {
      var test = 'import {a as b, c as d, f} from "./abc.sol";'
      assert.deepEqual(extract(test), ['./abc.sol'])
    })

    it('should work with single quotes', function () {
      var test = 'import {a as b, c as d, f} from \'./abc.sol\';'
      assert.deepEqual(extract(test), ['./abc.sol'])
    })
  })

  describe('finds imports within bigger file', function () {
    var test = `
      import "./abc.sol";
      import './def.sol';

      contract test {}
    `
    assert.deepEqual(extract(test), ['./abc.sol', './def.sol'])
  })

  it('finds imports in the same line', function () {
    var test = `
      import './abc.sol';import "./def.sol";
    `
    assert.deepEqual(extract(test), ['./abc.sol', './def.sol'])
  })

  it('ignores commented out imports', function () {
    var test = `
      import "./abc.sol";
      // import "./def.sol";
      // import './def.sol';
      /* import "./def.sol"; */
      /* import './def.sol'; */
      import './ghi.sol';
    `
    assert.deepEqual(extract(test), ['./abc.sol', './ghi.sol'])
  })

  it('ignores imports within string literals', function () {
    var test = `
      contract test {
        string a = 'import "./abc.sol";';
        string b = 'import "./abc.sol";';
      }
    `
    assert.deepEqual(extract(test), [])
  })

  it('handles escapes correctly', function () {
    var test = `
      contract test {
        string a = '\\'import "./abc.sol";';
        string b = "\\"import './abc.sol';";
        string c = "import \\"./abc.sol\\";";
        string d = 'import \\'./abc.sol\\';';
      }
    `
    assert.deepEqual(extract(test), [])
  })

  it('handles escaped quotes', function () {
    var test = 'import "./abc\\\".sol";'
    assert.deepEqual(extract(test), ['./abc\".sol'])

    test = 'import \'./abc\\\'.sol\';'
    assert.deepEqual(extract(test), ['./abc\'.sol'])
  })

  it('handles spaces before semicolon', function () {
    var test = 'import "./abc.sol" as x ;'
    assert.deepEqual(extract(test), ['./abc.sol'])
  });

  it('handles line comments before the imports', function () {
    var test = `
      // hello world
      import "./abc.sol" as x;
    `
    assert.deepEqual(extract(test), ['./abc.sol'])
  })

  it('handles block comments before the imports', function () {
    var test = `
      /* hello world */
      import "./abc.sol" as x;
    `
    assert.deepEqual(extract(test), ['./abc.sol'])
  })

  it('handles multi-line block comments before the imports', function () {
    var test = `
      /* hello
       * world
       */
      import "./abc.sol" as x;
    `
    assert.deepEqual(extract(test), ['./abc.sol'])
  })
})
