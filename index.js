'use strict'

const patterns = [
  /^import\s*"(.*?)"\s*(?:as \w+)?;/,
  /^import\s*\*\s*as\s+\w+\s+from\s*"(.*?)";/,
  /^import\s*{\s*\w+(?:\s+as\s+\w+)?(?:\s*,\s*\w+(?:\s+as\s+\w+)?)*\s*}\s*from\s*"(.*?)";/
]

const transitions = [
  { '/': 1, '"': 5, "'": 7 },
  { '*': 2, '/': 3 },
  { '\n': 0 },
  { '*': 4 },
  { '/': 0, default: 3 },
  { '"': 0, '\\': 6 },
  { default: 5 },
  { "'": 0, '\\': 8 },
  { default: 7 }
]

function extract(input) {
  var paths = []
  var state = 0

  for (var i = 0; i < input.length; i++) {
    var ch = input[i]

    state = (
      transitions[state][ch] ||
      transitions[state].default ||
      state
    )

    if (state === 0 && ch === 'i') {
      var test = input.substr(i)
      for (var regex of patterns) {
        var match = regex.exec(test)
        if (match) {
          paths.push(match[1])
          i += match[0].length - 1
          break
        }
      }
    }
  }
  return paths
}

module.exports = extract
