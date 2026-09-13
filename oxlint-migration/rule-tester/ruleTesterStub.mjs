const captured = [];

class RuleTester {
    constructor(config) {
        this.config = config;
    }

    run(name, rule, cases) {
        captured.push({name, cases});
    }
}

// Some upstream test files assign these before running (`RuleTester.afterAll = ...`).
RuleTester.afterAll = () => {};
RuleTester.describe = undefined;
RuleTester.it = undefined;
RuleTester.itOnly = undefined;

export {captured, RuleTester};
export default {RuleTester};
