solidity-extract-imports
========================

A simple tool to extract imports from Solidity source files

### Example


```javascript
const extract = require('solidity-extract-imports')

extract('import "./ownable.sol";')
// => ['./ownable.sol']
```

### Author

Federico Bond

### License

MIT
