const fs = require("fs");
const parser = require("solidity-parser-antlr");
const got = require("got");

const extract = require("./index");

const GITHUB_OAUTH_TOKEN_PATH = __dirname + "/github-oauth-token.txt"
const OAUTH_TOKEN = getGithubOauthToken();

// These are the repose used to validate the library.
// You should provide one array per repo.
// The first element of the array is a string with "owner/repoName".
// The second element is the path to the contracts, default "contracts".
const REPOS = [
  ["OpenZeppelin/openzeppelin-solidity"],
  ["zeppelinos/zos-lib"],
  ["0xProject/0x-monorepo", "packages/contracts"],
  ["decentraland/erc721"],
  ["decentraland/marketplace-contracts"],
  ["decentraland/land"],
  ["AugurProject/augur-core", "source/contracts"],
  ["aragon/aragonOS"]
];

function getGithubOauthToken() {
  if (!fs.existsSync(GITHUB_OAUTH_TOKEN_PATH)) {
    console.error("You need to get a personal Github OAuth token and pase it in ", GITHUB_OAUTH_TOKEN_PATH);
    console.error("See: https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line")
    process.exit(1);
  }

  return fs.readFileSync(GITHUB_OAUTH_TOKEN_PATH, {encoding: "utf8"}).trim();
}

function extractWithParser(content) {
  const importedFiles = [];

  const ast = parser.parse(content, { tolerant: true });

  if (ast) {
    parser.visit(ast, {
      ImportDirective: node => importedFiles.push(node.path)
    });
  }

  return importedFiles;
}

function compareSets(set1, set2) {
  if (set1.size !== set2.size) {
    return false;
  }

  for (const e of set1)
    if (!set2.has(e)) {
      return false;
    }

  return true;
}

function compareExtractedImports(fileContent, fileUrl) {
  const withThisLib = new Set(extract(fileContent));
  let withTheParser;

  try {
    withTheParser = new Set(extractWithParser(fileContent));
  } catch (error) {
    console.error("Error parsing %s -- Ignoring\n\n", fileUrl);
    return true;
  }

  const match = compareSets(withThisLib, withTheParser);

  if (!match) {
    console.error("File doesn't match: ", fileUrl);
    console.error(
      "  - Expected %s, and got %s\n\n",
      JSON.stringify([...withTheParser]),
      JSON.stringify([...withThisLib])
    );
  }

  return match;
}

async function getGithubContent(repoName, path) {
  const apiUrl = `https://api.github.com/repos/${repoName}/contents/${path}?access_token=${OAUTH_TOKEN}`;
  const response = await got(apiUrl, { json: true });
  return response.body;
}

async function compareSolidityFile(file) {
  const content = await got(file.download_url);
  return compareExtractedImports(content.body, file.html_url);
}

async function validateRepoContracts(repoName, contractsDirPath = "contracts") {
  const files = await getGithubContent(repoName, contractsDirPath);

  const dirs = files.filter(file => file.type === "dir");
  const solidityFiles = files.filter(
    file => file.type === "file" && file.path.toLowerCase().endsWith(".sol")
  );

  const dirPromises = dirs.map(d => validateRepoContracts(repoName, d.path));
  const solidityFilePromises = solidityFiles.map(compareSolidityFile);

  const results = await Promise.all([...dirPromises, ...solidityFilePromises]);
  return results.every(a => a);
}

async function validateAll(repos) {
  return Promise.all(repos.map(repo => validateRepoContracts(...repo)));
}

validateAll(REPOS).catch(console.error);
