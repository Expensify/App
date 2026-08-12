// Stands in for `eslint`'s and `@typescript-eslint/rule-tester`'s RuleTester so an upstream test
// file can be imported for its cases instead of executed.
//
// The rule modules under test are shared between ESLint and oxlint; the AST they run against is
// not. So the value in these test files is the ~400 hand-written cases, and the way to reuse them
// is to capture the arguments of `ruleTester.run(...)` rather than to let it assert anything.
//
// Redirected here by resolveHook.mjs. Nothing in this module runs a linter.
const captured = [];

class RuleTester {
    constructor(config) {
        this.config = config;
    }

    run(name, rule, cases) {
        captured.push({name, cases});
    }
}

// Some upstream files assign these before running (`RuleTester.afterAll = ...`). Declaring them
// keeps the assignment from being the thing that breaks the harvest.
RuleTester.afterAll = () => {};
RuleTester.describe = undefined;
RuleTester.it = undefined;
RuleTester.itOnly = undefined;

export {captured, RuleTester};
export default {RuleTester};
