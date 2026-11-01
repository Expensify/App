import {ONYX_READ_BAN, collectDisableDirectivesFromSource} from '../../scripts/onyxLintBypass';
import {MIN_REASON_LENGTH, ONYX_SNAPSHOT_KEY_RULE, collectUnreasonedDisables} from '../../scripts/onyxLintDisableReason';

const RULE_ID = 'rulesdir/no-onyx-get-snapshot-key';
const snapshotKeyRead = `await Onyx${'.get'}(\`\${ONYXKEYS.COLLECTION.REPORT}\${reportID}\`);`;
const REASON = 'replaces a module-level Onyx.connect used only by handlers, never read a snapshot';
const FILE = 'src/components/Foo.tsx';

describe('collectUnreasonedDisables', () => {
    it('accepts a next-line disable that explains itself', () => {
        // Given a deliberate live read of a snapshot key, disabled with a reason after --
        const source = [`// eslint-disable-next-line ${RULE_ID} -- ${REASON}`, snapshotKeyRead].join('\n');

        // When the reason check scans it
        // Then nothing is reported, because a written reason is the intended way past this rule
        expect(collectUnreasonedDisables(source, FILE)).toEqual([]);
    });

    it('accepts a same-line disable that explains itself', () => {
        // Given the trailing eslint-disable-line form with a reason
        const source = `${snapshotKeyRead} // eslint-disable-line ${RULE_ID} -- ${REASON}`;

        // When the reason check scans it
        // Then nothing is reported, because each line form covers a single read
        expect(collectUnreasonedDisables(source, FILE)).toEqual([]);
    });

    it('flags a disable with no reason', () => {
        // Given a disable that names the rule and stops there
        const source = [`// eslint-disable-next-line ${RULE_ID}`, snapshotKeyRead].join('\n');

        // When the reason check scans it
        // Then the directive is reported with its own line, so the author adds the reason there
        expect(collectUnreasonedDisables(source, FILE)).toEqual([{file: FILE, line: 1}]);
    });

    it('flags a reason with too few letters or digits', () => {
        // Given a token reason, a row of punctuation, a reason of only stars and spaces, and one with exactly enough letters
        const tooShort = [`// eslint-disable-next-line ${RULE_ID} -- ok`, snapshotKeyRead].join('\n');
        const punctuation = [`// eslint-disable-next-line ${RULE_ID} -- ----------------`, snapshotKeyRead].join('\n');
        const stars = [`/* eslint-disable-next-line ${RULE_ID} -- * * * * * * * * * * * * * */`, snapshotKeyRead].join('\n');
        const justEnough = [`// eslint-disable-next-line ${RULE_ID} -- ${'x'.repeat(MIN_REASON_LENGTH)}`, snapshotKeyRead].join('\n');

        // When the reason check scans each
        // Then all but the last are reported, since the floor counts letters and digits and ignores punctuation and spaces
        expect(collectUnreasonedDisables(tooShort, FILE)).toEqual([{file: FILE, line: 1}]);
        expect(collectUnreasonedDisables(punctuation, FILE)).toEqual([{file: FILE, line: 1}]);
        expect(collectUnreasonedDisables(stars, FILE)).toEqual([{file: FILE, line: 1}]);
        expect(collectUnreasonedDisables(justEnough, FILE)).toEqual([]);
    });

    it('flags a same-line disable with no reason', () => {
        // Given the trailing eslint-disable-line form without a reason
        const source = `${snapshotKeyRead} // eslint-disable-line ${RULE_ID}`;

        // When the reason check scans it
        // Then it is reported like the next-line form, since both silence one read
        expect(collectUnreasonedDisables(source, FILE)).toEqual([{file: FILE, line: 1}]);
    });

    it('flags a block disable of the rule even with a reason', () => {
        // Given a block disable that names the rule with a reason, closed later
        const source = [`/* eslint-disable ${RULE_ID} -- ${REASON} */`, snapshotKeyRead, snapshotKeyRead, `/* eslint-enable ${RULE_ID} */`].join('\n');

        // When the reason check scans it
        // Then the block is reported, because one reason cannot vouch for every read under it
        expect(collectUnreasonedDisables(source, FILE)).toEqual([{file: FILE, line: 1}]);
    });

    it('flags a reasonless disable under the bare, plugin-qualified and quoted names', () => {
        // Given disables that name the rule without the rulesdir prefix, with another plugin prefix, and in quotes
        const bare = [`// eslint-disable-next-line ${ONYX_SNAPSHOT_KEY_RULE.name}`, snapshotKeyRead].join('\n');
        const qualified = [`// eslint-disable-next-line localRules/${ONYX_SNAPSHOT_KEY_RULE.name}`, snapshotKeyRead].join('\n');
        const quoted = [`// eslint-disable-next-line "${RULE_ID}"`, snapshotKeyRead].join('\n');

        // When the reason check scans them
        // Then all three are reported, since ESLint accepts each spelling, so each one needs a reason
        expect(collectUnreasonedDisables(bare, FILE)).toEqual([{file: FILE, line: 1}]);
        expect(collectUnreasonedDisables(qualified, FILE)).toEqual([{file: FILE, line: 1}]);
        expect(collectUnreasonedDisables(quoted, FILE)).toEqual([{file: FILE, line: 1}]);
    });

    it('ignores disables of other rules and blanket disables', () => {
        // Given a disable of another rule and a blanket disable over a snapshot key read
        const source = ['// eslint-disable-next-line no-console', 'console.log(1);', '/* eslint-disable */', snapshotKeyRead].join('\n');

        // When the reason check scans it
        // Then nothing is reported, since the bypass check owns blanket disables
        expect(collectUnreasonedDisables(source, FILE)).toEqual([]);
    });

    it('covers every file the rule lints except tests', () => {
        // Given files under src, .storybook and tests, plus a doc
        // When the rule decides which files it checks
        // Then only test suites are out of scope, like the Onyx read ban
        expect(ONYX_SNAPSHOT_KEY_RULE.appliesTo('src/pages/Foo.tsx')).toBe(true);
        expect(ONYX_SNAPSHOT_KEY_RULE.appliesTo('.storybook/preview.tsx')).toBe(true);
        expect(ONYX_SNAPSHOT_KEY_RULE.appliesTo('tests/unit/FooTest.ts')).toBe(false);
        expect(ONYX_SNAPSHOT_KEY_RULE.appliesTo('contributingGuides/LINTING.md')).toBe(false);
    });

    it('fails closed when the file cannot be parsed', () => {
        // Given a file with a syntax error, a reasoned disable of the rule, and a reasonless one
        const source = ['const = ;', `// eslint-disable-next-line ${RULE_ID} -- ${REASON}`, snapshotKeyRead, `// eslint-disable-next-line ${RULE_ID}`, snapshotKeyRead].join('\n');

        // When the reason check scans it
        // Then both directives naming the rule are reported, even the reasoned one, since no reason can be checked without an AST
        expect(collectUnreasonedDisables(source, FILE)).toEqual([
            {file: FILE, line: 2},
            {file: FILE, line: 4},
        ]);
    });

    it('reads the reason only after a spaced double dash, as ESLint does', () => {
        // Given a directive whose `--` touches the preceding word, so ESLint sees no description at all
        const source = [`// eslint-disable-next-line ${RULE_ID}, x--aaaaaaaaaaaaaaaa`, snapshotKeyRead].join('\n');

        // When the reason check scans it
        // Then it is reported, because the text after `--` is not a description to ESLint either
        expect(collectUnreasonedDisables(source, FILE)).toEqual([{file: FILE, line: 1}]);
    });
});

describe('a reasoned key disable next to the read ban', () => {
    it('does not let a reasoned key disable silence no-unsafe-onyx-read', () => {
        // Given a disable that names both rules, with a reason
        const source = [`// eslint-disable-next-line ${RULE_ID}, rulesdir/no-unsafe-onyx-read -- ${REASON}`, snapshotKeyRead].join('\n');

        // When the read ban scans it
        // Then it still counts as a read bypass, because a reason may justify the key choice but not the read
        expect(collectDisableDirectivesFromSource(source, FILE, ONYX_READ_BAN)).toEqual([{file: FILE, line: 1}]);
    });
});

describe('a config comment for the snapshot key rule', () => {
    it('is always reported, even with a reason', () => {
        // Given a config comment that turns the rule off for the whole file with a long reason after `--`
        const source = [`/* eslint ${RULE_ID}: off -- ${REASON} */`, snapshotKeyRead].join('\n');

        // When the reason check scans it
        // Then it is reported, since the rule is off for the whole file and the reason covers nothing specific
        expect(collectUnreasonedDisables(source, FILE)).toEqual([{file: FILE, line: 1}]);
    });
});
