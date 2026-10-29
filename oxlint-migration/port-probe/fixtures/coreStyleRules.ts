// Fixture for the ESLint core rules hosted through the `core/` alias, plus the two oxlint
// implements natively. One deliberate violation per rule; the harness matches on (file, line, rule)
// so the rules are free to share a file.
'use strict'; // strict ['never']: the directive is redundant inside a module

let firstName, secondName; // one-var ['never']

let placeholder = undefined; // no-undef-init

const wrapper = new Object(); // no-new-object in ESLint, reported by oxlint's no-object-constructor

class TwoAdjacentMembers {
    first() {}
    second() {} // lines-between-class-members ['always']: no blank line above
}

export {firstName, placeholder, secondName, TwoAdjacentMembers, wrapper};
