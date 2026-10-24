// Fixture for the two rules oxc's parser makes unreachable in ESM: in a module, legacy octal
// syntax is a parse error ("'0'-prefixed octal literals and octal escape sequences are
// deprecated"), so only a script-mode file can hold the violations a linter rule would see.
// That is exactly the coverage these two rules still add, and why they are wired.
const legacyOctalLiteral = 010; // no-octal

const octalEscapeSequence = 'copyright \251'; // no-octal-escape

module.exports = {legacyOctalLiteral, octalEscapeSequence};
