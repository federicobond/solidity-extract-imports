'use strict'

const REGEXES = [
  /^import\s*"(.*?)"\s*(?:as \w+)?;/,
  /^import\s*\*\s*as\s+\w+\s+from\s*"(.*?)";/,
  /^import\s*{\s*\w+(?:\s+as\s+\w+)?(?:\s*,\s*\w+(?:\s+as\s+\w+)?)*\s*}\s*from\s*"(.*?)";/
]

function extract(input) {
  var paths = []
  var state = 1

  for (var i = 0; i < input.length; i++) {
    var ch = input[i]
    switch (state) {
      case 1:
        if (ch == '/') {
          state = 2
        } else if (ch == '"') {
          state = 6
        } else if (ch == "'") {
          state = 8
        } else if (ch == 'i') {
          var test = input.substr(i)
          for (var regex of REGEXES) {
            var match = regex.exec(test)
            if (match) {
              paths.push(match[1])
              i += match[0].length - 1 // check off-by-one
              break
            }
          }
        }
        break
      case 2:
        if (ch == '/') {
          state = 3
        } else if (ch == '*') {
          state = 4
        }
        break
      case 3:
        if (ch == '\n') {
          state = 1
        }
        break
      case 4:
        if (ch == '*') {
          state = 5
        }
        break
      case 5:
        if (ch == '/') {
          state = 1
        } else {
          state = 4
        }
        break
      case 6:
        if (ch == '"') {
          state = 1
        } else if (ch == '\\') {
          state = 7
        }
        break
      case 7:
        state = 6
        break
      case 8:
        if (ch == "'") {
          state = 1
        } else if (ch == '\\') {
          state = 9
        }
        break
      case 9:
        state = 8
        break
    }
  }
  return paths
}

module.exports = extract
