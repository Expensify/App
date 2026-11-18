import type {Rule} from 'eslint';

import {RuleTester} from 'eslint';
import {parser as tsParser} from 'typescript-eslint';

type LocalRuleModule = Rule.RuleModule & {
    name: string;
};

function isLocalRuleModule(ruleModule: unknown): ruleModule is LocalRuleModule {
    if (typeof ruleModule !== 'object' || ruleModule === null) {
        return false;
    }

    const ruleName: unknown = Reflect.get(ruleModule, 'name');
    const create: unknown = Reflect.get(ruleModule, 'create');
    const meta: unknown = Reflect.get(ruleModule, 'meta');

    return typeof ruleName === 'string' && typeof create === 'function' && typeof meta === 'object' && meta !== null;
}

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-opaque-namespace-usage');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-opaque-namespace-usage to export an ESLint rule module.');
}

const tsRuleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: tsParser,
    },
});

const tsxRuleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: tsParser,
        parserOptions: {ecmaFeatures: {jsx: true}},
    },
});

const IMPORT = "import * as Utils from '@libs/Utils';";

/**
 * @param usage The label of the usage the rule is expected to report.
 * @returns The expected rule error for the `Utils` namespace.
 */
function usageError(usage: string): {messageId: string; data: Record<string, string>} {
    return {messageId: 'opaqueNamespaceUsage', data: {name: 'Utils', usage}};
}

describe('no-opaque-namespace-usage', () => {
    tsRuleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // Given a plain member access, which knip tracks per export.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export const value = Utils.member;`},
            // Given a string literal key, which knip resolves statically.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export const value = Utils['member'];`},
            // Given a template key without substitutions, which knip resolves statically.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export const value = Utils[\`member\`];`},
            // Given plain destructuring, which names the used exports.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const {a, b} = Utils; export {a, b};`},
            // Given computed-key destructuring, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const key = 'a'; const {[key]: value} = Utils; export {value};`},
            // Given an assignment-expression rest, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} let a; let rest; ({a, ...rest} = Utils); export {a, rest};`},
            // Given the namespace used as the key of another object, not as the object.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const map = {}; export const value = map[Utils];`},
            // Given the namespace used as the computed key of an object literal, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const holder = {[Utils]: 1}; export {holder};`},
            // Given a namespace passed as an argument, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} register(Utils);`},
            // Given a returned namespace, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export function get() { return Utils; }`},
            // Given a spread into a declared array, which is not an alias.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const list = [...Utils]; register(list);`},
            // Given a spread into an object literal passed to a call, which is not an alias.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} register({...Utils});`},
            // Given an exported spread alias, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export const copy = {...Utils};`},
            // Given a default value in a nested array pattern, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const [[a = Utils]] = list; export {a};`},
            // Given a default value in the head of a for-of loop, which has no initializer and which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} for (const {a = Utils} of list) { use(a); }`},
            // Given `Object.freeze`, which is not an enumeration and knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export const frozen = Object.freeze(Utils);`},
            // Given a `keys` method of another object, which is not an enumeration of the namespace.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} Registry.keys(Utils);`},
            // Given `Object[keys]` with a computed callee, which knip does not recognize as an enumeration and tracks. It guards the `!callee.computed` check.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const keys = 'values'; Object[keys](Utils);`},
            // Given a namespace returned from a ternary, which is not assigned to a variable.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export function get(flag) { return flag ? Utils : other; }`},
            // Given the namespace used as the test of a ternary, which is not an alias.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export const value = Utils ? 1 : 2;`},
            // Given a parameter that shadows the namespace name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export function run(Utils) { return Utils[Utils.key]; }`},
            // Given a TypeScript `as` wrapper around a computed key, which knip does not see through.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export const value = (Utils as Foo)[key];`},
            // Given a rest destructuring of a wrapped namespace, which knip does not see through.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const {a, ...rest} = Utils as Foo; export {a, rest};`},
            // Given an alias wrapped by `as`, which knip does not see through.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const Alias = Utils as Foo; export {Alias};`},
            // Given an alias whose members are read, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const Alias = Utils; Alias.member();`},
            // Given a ternary alias whose members are read, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const target = flag ? Utils : other; target.member();`},
            // Given a spread alias whose members are read, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const copy = {...Utils}; copy.member();`},
            // Given an object property alias whose members are read, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const holder = {utils: Utils}; holder.utils.member();`},
            // Given an object property alias whose members are read by a string key, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const holder = {utils: Utils}; holder.utils['member']();`},
            // Given a string object property key that holds the namespace, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const holder = {'utils': Utils}; export {holder};`},
            // Given a call argument inside an object literal alias, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const holder = {utils: wrap(Utils)}; export {holder};`},
            // Given an alias read after its declaration inside a function declared after it, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const Alias = Utils; function run() {Alias.member();} run();`},
            // Given an alias read both before and after its declaration, where the later read is the one knip counts.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} function run() {Alias.member();} const Alias = Utils; Alias.member(); run();`},
            // Given two aliases with the same name, where knip matches by name and the read follows the first declaration.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} function first() {const Alias = Utils; return 1;} function second() {const Alias = Utils; return Alias.member();} first(); second();`},
            // Given an alias of a named import that is read before a namespace alias with the same name is declared, where knip registers both under one name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import {obj} from './other'; function first() {const Alias = obj; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
            },
            // Given a ternary alias and a spread alias of a named import, and a default import alias, which knip registers like a namespace alias.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import Def, {obj} from './other'; function first() {const Alias = flag ? obj : Def; return Alias.member;} function second() {const Alias = {...obj}; return Alias.member;} function third() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second(); third();`,
            },
            // Given an exported spread of the namespace, which knip counts as an access to every alias with the same name, whatever the scope and order.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} Utils.used(); export const copy = {...Utils}; function run() {const copy = Utils; return 1;} run();`},
            // Given an exported nested spread and an exported spread of an internal named import, which knip counts the same way.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} import {obj} from './other'; Utils.used(); export const copy = {a: {...obj}}; function run() {const copy = Utils; return 1;} run();`},
            // Given an alias that a destructuring default of a named import declares, which knip registers and reads before a namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import {obj} from './other'; function first() {const {value: Alias = obj} = source; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
            },
            // Given an alias read by a parameter of the same name after the declaration, which knip counts because it matches aliases by name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const Alias = Utils; function read(Alias) {return Alias.member();} read({});`},
            // Given an alias read by `Alias?.member`, which is a member access for knip.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const Alias = Utils; Alias?.member();`},
            // Given an object literal that holds the namespace in a call argument, which is not an alias.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} register({utils: Utils});`},
            // Given a named import, which is not a namespace.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: "import {member} from '@libs/Utils'; export const value = member[key];"},
            // Given a type-only namespace import, which has no runtime exports to hide.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: "import type * as Utils from '@libs/Utils'; export const value = Utils[key];"},
            // Given a namespace import of a package, which knip does not report unused exports for.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: "import * as Pkg from 'some-package'; export const value = Pkg[key];"},
            // Given an alias of a type-only default import of an internal module, which knip registers as an alias, so the read counts for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import type Def from './other'; function first() {const Alias = Def; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
            },
            // Given a ternary alias of an inline type named import of an internal module, which knip registers as an alias, so the read counts for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import {type member as Item} from './other'; function first() {const Alias = flag ? Item : 1; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
            },
            // Given a spread alias of a type-only namespace import of an internal module, which knip registers as an alias, so the read counts for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import type * as Other from './other'; function first() {const Alias = {...Other}; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
            },
            // Given an alias of an `import = require` of an internal module, which knip registers as an alias, so the read counts for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import Other = require('./other'); function first() {const Alias = Other; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
            },
            // Given an alias of a JSON import, which knip registers as an alias, so the read counts for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import data from './data.json'; function first() {const Alias = data; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
            },
            // Given a ternary alias of an asset import through a path alias, which knip registers as an alias, so the read counts for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import logo from '@assets/images/logo.png'; function first() {const Alias = flag ? logo : 1; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
            },
            // Given a spread alias of a re-exported import, which knip registers as an alias, so the read counts for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import {Item} from './barrel'; function first() {const Alias = {...Item}; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
            },
            // Given an alias of a default import through a path alias, which knip registers as an alias, so the read counts for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import Other from '@libs/Other'; function first() {const Alias = Other; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
            },
            // Given an alias of another internal namespace import, which knip registers as an alias, so the read counts for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {
                code: `${IMPORT} import * as Other from '@libs/Other'; function first() {const Alias = Other; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
            },
        ],
        invalid: [
            // Given a computed key, which knip cannot resolve to an export.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} export const value = Utils[key];`, errors: [usageError('computed key')]},
            // Given an optional computed key, which knip cannot resolve to an export.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} export const value = Utils?.[key];`, errors: [usageError('computed key')]},
            // Given a numeric key, which knip does not treat as a static key.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} export const value = Utils[0];`, errors: [usageError('computed key')]},
            // Given a template key with a substitution, which knip cannot resolve.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} export const value = Utils[\`prefix\${key}\`];`, errors: [usageError('computed key')]},
            // Given two opaque usages of the same namespace.
            // When the rule checks how the namespace is used.
            // Then both usages are reported.
            {code: `${IMPORT} export const value = Utils[key]; export const names = Object.keys(Utils);`, errors: [usageError('computed key'), usageError('enumeration')]},
            // Given `Object.keys`, which knip treats as reading every export.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} Object.keys(Utils);`, errors: [usageError('enumeration')]},
            // Given `Object.values`, which knip treats as reading every export.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} Object.values(Utils);`, errors: [usageError('enumeration')]},
            // Given `Object.entries`, which knip treats as reading every export.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} Object.entries(Utils);`, errors: [usageError('enumeration')]},
            // Given `Object.getOwnPropertyNames`, which knip treats as reading every export.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} Object.getOwnPropertyNames(Utils);`, errors: [usageError('enumeration')]},
            // Given `Object.keys` with the namespace after another argument, which knip also treats as reading every export.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} export const keys = Object.keys(other, Utils);`, errors: [usageError('enumeration')]},
            // Given `for...in`, which knip treats as reading every export.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} for (const key in Utils) { use(key); }`, errors: [usageError('enumeration')]},
            // Given `for...of`, which knip treats as reading every export.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} for (const value of Utils) { use(value); }`, errors: [usageError('enumeration')]},
            // Given a rest destructuring, which knip cannot track even when the rest is unused.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const {a, ...rest} = Utils; export {a};`, errors: [usageError('rest destructuring')]},
            // Given a default value of a destructured property, which knip treats as an opaque use.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const {a = Utils} = obj; export {a};`, errors: [usageError('destructuring default')]},
            // Given an alias that is only exported, which knip cannot follow.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const Alias = Utils; export {Alias};`, errors: [usageError('unread alias')]},
            // Given an alias whose name is member-accessed only on another variable.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const Alias = Utils; other.member(); export {Alias};`, errors: [usageError('unread alias')]},
            // Given a shorthand object property alias that is only exported, which knip cannot follow.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const holder = {Utils}; export {holder};`, errors: [usageError('unread alias')]},
            // Given an object property alias read by a computed holder key with an identifier, which knip cannot follow.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const holder = {utils: Utils}; const utils = 'utils'; holder[utils].member(); register(holder);`, errors: [usageError('unread alias')]},
            // Given an object property alias read without a member of the namespace, which knip cannot follow.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const holder = {utils: Utils}; register(holder.utils);`, errors: [usageError('unread alias')]},
            // Given an object property alias read by a computed member key, which knip cannot follow.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const holder = {utils: Utils}; holder.utils[key]; register(holder);`, errors: [usageError('unread alias')]},
            // Given a spread alias that is only passed to a call, which knip cannot follow.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const copy = {...Utils}; register(copy);`, errors: [usageError('unread alias')]},
            // Given a ternary alias with the namespace in the first branch that is never read.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const target = flag ? Utils : other; export {target};`, errors: [usageError('unread alias')]},
            // Given two aliases of the same namespace that are never read.
            // When the rule checks how the namespace is used.
            // Then both usages are reported.
            {code: `${IMPORT} const First = Utils; const Second = Utils; export {First, Second};`, errors: [usageError('unread alias'), usageError('unread alias')]},
            // Given an exported spread nested under a quoted key, which knip does not follow, so the alias with the same name is not counted as read.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import {obj} from './other'; Utils.used(); export const copy = {'nested': {...obj}}; function run() {const copy = Utils; return 1;} run();`,
                errors: [usageError('unread alias')],
            },
            // Given an exported spread of a package import, which knip does not count as an access to the alias with the same name.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import pkg from 'some-package'; Utils.used(); export const copy = {...pkg}; function run() {const copy = Utils; return 1;} run();`,
                errors: [usageError('unread alias')],
            },
            // Given an earlier alias that holds a named import in an object, which knip does not register as an alias, so the read before the namespace alias is not counted.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import {obj} from './other'; function first() {const Alias = {key: obj}; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
                errors: [usageError('unread alias')],
            },
            // Given an alias read only in a function declared before the alias, which knip does not count because it registers aliases in source order.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} function run() {Alias.member();} const Alias = Utils; Utils.other(); run();`, errors: [usageError('unread alias')]},
            // Given an alias read at the top level before its declaration with `var`, which knip does not count.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} Alias.member(); var Alias = Utils; Utils.other();`, errors: [usageError('unread alias')]},
            // Given a class method that reads the alias before the declaration, which knip does not count.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} class Foo {run() {return Alias.member();}} const Alias = Utils; Utils.other();`, errors: [usageError('unread alias')]},
            // Given a ternary alias read only before its declaration, which knip does not count.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} function run() {target.member();} const target = flag ? Utils : other; run();`, errors: [usageError('unread alias')]},
            // Given a spread alias read only before its declaration, which knip does not count.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} function run() {copy.member();} const copy = {...Utils}; run();`, errors: [usageError('unread alias')]},
            // Given an object property alias read only before its declaration, which knip does not count.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} function run() {holder.utils.member();} const holder = {utils: Utils}; run();`, errors: [usageError('unread alias')]},
            // Given an alias read only through a non-null assertion, which knip does not see as a member access of the alias.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const Alias = Utils; Alias!.member(); Utils.other();`, errors: [usageError('unread alias')]},
            // Given an alias read only by a type query, which knip does not count.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const Alias = Utils; export type Member = typeof Alias.member; Utils.other();`, errors: [usageError('unread alias')]},
            // Given an alias that is only destructured, which knip does not count as a member read.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const Alias = Utils; const {member} = Alias; export {member};`, errors: [usageError('unread alias')]},
            // Given an `@src` source, which resolves to an internal module.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: "import * as Utils from '@src/libs/Utils'; export const value = Utils[key];", errors: [usageError('computed key')]},
            // Given a `tests/` source, which resolves to an internal module.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: "import * as Utils from 'tests/utils/Utils'; export const value = Utils[key];", errors: [usageError('computed key')]},
            // Given a parent-relative source, which resolves to an internal module.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: "import * as Utils from '../Utils'; export const value = Utils[key];", errors: [usageError('computed key')]},
            // Given an alias of a default import of a package, which knip does not register as an alias, so the read does not count for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import React from 'react'; function first() {const Alias = React; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
                errors: [usageError('unread alias')],
            },
            // Given an alias of a named import of a package, which knip does not register as an alias, so the read does not count for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import {createElement as Item} from 'react'; function first() {const Alias = Item; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
                errors: [usageError('unread alias')],
            },
            // Given an alias of a namespace import of a package, which knip does not register as an alias, so the read does not count for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import * as Pkg from 'react'; function first() {const Alias = Pkg; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
                errors: [usageError('unread alias')],
            },
            // Given a ternary alias of a default import of a package, which knip does not register as an alias, so the read does not count for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import React from 'react'; function first() {const Alias = flag ? React : 1; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
                errors: [usageError('unread alias')],
            },
            // Given a spread alias of a default import of a package, which knip does not register as an alias, so the read does not count for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import React from 'react'; function first() {const Alias = {...React}; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
                errors: [usageError('unread alias')],
            },
            // Given an alias of a built-in module import, which knip does not register as an alias, so the read does not count for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import fs from 'node:fs'; function first() {const Alias = fs; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
                errors: [usageError('unread alias')],
            },
            // Given an alias of a type-only import of a package, which knip does not register as an alias, so the read does not count for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import type Pkg from 'react'; function first() {const Alias = Pkg; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
                errors: [usageError('unread alias')],
            },
            // Given an alias of an `import = require` of a package, which knip does not register as an alias, so the read does not count for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import Pkg = require('react'); function first() {const Alias = Pkg; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
                errors: [usageError('unread alias')],
            },
            // Given an object property alias of a default import of an internal module, which knip does not register as an alias, so the read does not count for the namespace alias with the same name.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {
                code: `${IMPORT} import Other from './other'; function first() {const Alias = {key: Other}; return Alias.member;} function second() {const Alias = Utils; consume(Alias);} Utils.other(); first(); second();`,
                errors: [usageError('unread alias')],
            },
        ],
    });

    tsxRuleTester.run(`${ruleModule.name} (tsx)`, ruleModule, {
        valid: [
            // Given a JSX attribute that receives the namespace, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export const element = <Foo utils={Utils} />;`},
            // Given a JSX tag that is a member of the namespace itself, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export const element = <Utils.Member />;`},
            // Given a nested JSX tag on the namespace itself, which knip tracks.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} export const element = <Utils.Group.Member />;`},
            // Given a `.tsx` alias that is also read as a value, which knip counts.
            // When the rule checks how the namespace is used.
            // Then nothing is reported.
            {code: `${IMPORT} const Alias = Utils; export const element = <Foo value={Alias.member} />;`},
        ],
        invalid: [
            // Given a computed key in a `.tsx` file.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} export const element = <Foo value={Utils[key]} />;`, errors: [usageError('computed key')]},
            // Given a `.tsx` alias that is read only as a JSX tag, which knip does not count as a member read of the alias.
            // When the rule checks how the namespace is used.
            // Then the usage is reported.
            {code: `${IMPORT} const Alias = Utils; export const element = <Alias.Member />; Utils.other();`, errors: [usageError('unread alias')]},
        ],
    });
});
