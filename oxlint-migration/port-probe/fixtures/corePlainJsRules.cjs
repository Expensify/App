// Fixture for the three ESLint core rules that are hosted through the `core/` alias for plain JS
// only, because typescript-eslint's `eslint-recommended` switches them off for TS. The file is .cjs
// for two reasons: it lands inside the plain-JS scope both configs use, and `no-dupe-args` is only
// reachable in sloppy mode -- duplicate parameter names are a parse error in a module on both tools.
const target = {literalKey: 1};

const readWithBrackets = target['literalKey']; // dot-notation

function duplicated(sameName, sameName) {
    return sameName;
} // no-dupe-args

async function awaitedReturn() {
    return await Promise.resolve(1); // no-return-await
}

module.exports = {awaitedReturn, duplicated, readWithBrackets};
