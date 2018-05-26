'use strict'

const patterns = [
  /^import\s*("|')(.*?)\1\s*(?:as \w+)?;/,
  /^import\s*\*\s*as\s+\w+\s+from\s*("|')(.*?)\1;/,
  /^import\s*{\s*\w+(?:\s+as\s+\w+)?(?:\s*,\s*\w+(?:\s+as\s+\w+)?)*\s*}\s*from\s*("|')(.*?)\1;/
]

const transitions = [
  null,
  { '/': 2, '"': 6, "'": 8 },
  { '*': 3, '/': 4 },
  { '\n': 1 },
  { '*': 5 },
  { '/': 1, default: 4 },
  { '"': 1, '\\': 7 },
  { default: 6 },
  { "'": 1, '\\': 9 },
  { default: 8 }
]

function extract(input) {
  var paths = []
  var state = 1

  for (var i = 0; i < input.length; i++) {
    var ch = input[i]

    state = (
      transitions[state][ch] ||
      transitions[state].default ||
      state
    )

    if (state === 1 && ch === 'i') {
      var test = input.substr(i)
      for (var regex of patterns) {
        var match = regex.exec(test)
        if (match) {
          paths.push(match[2])
          i += match[0].length - 1
          break
        }
      }
    }
  }
  return paths
}

module.exports = extract
