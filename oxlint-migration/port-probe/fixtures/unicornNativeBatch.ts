// Fixture for the five unicorn/* rules production enables on both tools. One violation per rule, each with a
// control next to it that is the shape the rule asks for, so a row cannot be pinned by an always-reporting file.

const words = ['alpha', 'beta', 'gamma'];

// prefer-set-has is reported at the declaration, and only when the array has more than one read and every
// read is a membership test -- a lone `.includes()` call is not a finding on either tool.
const lookup = ['alpha', 'beta'];

const wordSet = new Set(words);

// no-array-for-each control: a for-of loop.
for (const word of words) {
    void word;
}

// no-array-for-each
words.forEach((word) => {
    void word;
});

// prefer-array-find control.
const foundWord = words.find((word) => word.startsWith('b'));

// prefer-array-find
const filteredWord = words.filter((word) => word.startsWith('b'))[0];

// prefer-set-has control: a Set asked with has().
if (wordSet.has('alpha')) {
    void foundWord;
}

// prefer-set-has: an array whose only reads are membership tests.
const lookupIsMember = lookup.includes('alpha');
const lookupSecondMember = lookup.includes('gamma');

// prefer-set-size control.
const sizeDirectly = wordSet.size;

// prefer-set-size: a Set built and spread in one expression. This is the only shape both tools see under
// @typescript-eslint/parser -- eslint-plugin-unicorn also matches `[...set].length` and
// `Array.from(set).length` for a `const set = new Set()`, but its isSet() check needs the variable
// definition's `kind`, which typescript-eslint's scope manager leaves undefined, so those shapes report
// on oxlint only. oxlint additionally matches Array.from(), which ESLint never has. See the manifest why.
const sizeIndirectly = [...new Set(words)].length;

// prefer-string-replace-all: a global regex with String#replace.
const replacedIndividually = 'foo'.replace(/o/g, 'x');

// prefer-string-replace-all control: the call the rule asks for.
const replacedCorrectly = 'foo'.replaceAll('o', 'x');

export const unicornBatchMarker = [foundWord, filteredWord, lookupIsMember, lookupSecondMember, sizeDirectly, sizeIndirectly, replacedIndividually, replacedCorrectly];

// Two exports on purpose: the probe's base config enables prefer-default-export for every file, and a
// single-export file draws an extra finding from oxlint that ESLint does not see on a .ts fixture.
export const unicornBatchWords = words;
