// ydnlBatch — one violating statement per you-dont-need-lodash-underscore/* rule production enables as a
// bare "error" (uniq already lives in fixtures/youDontNeedLodash.ts). Every rule in this plugin is
// generated from a lodash method name and matches one of exactly two shapes: a call on an object named
// `_`, `lodash` or `underscore`, or an import of that name from `lodash`/`lodash/<method>`. One default
// lodash import therefore reaches all 70 — the few Underscore-only aliases (collect, detect, foldl,
// inject, all, any, pairs, select) are simply names the rule keys on, not calls that exist at runtime.
// Keep one call per line: the harness matches on (file, line, rule). sortBy is imported as the control for
// the named-import shape: the plugin has no sortBy rule, so that specifier must stay silent.
import _, {sortBy} from 'lodash';

type Row = Record<string, unknown>;

export function lodashRuleProbe(
    values: number[],
    nested: number[][],
    other: number[],
    obj: Row,
    text: string,
    fn: () => void,
    buffer: ArrayBuffer,
    date: Date,
    count: number,
    value: unknown,
): unknown[] {
    // Everything lands in one sink so no line is an unused expression: the point of the controls is that the
    // only findings on this file are the 70 in the manifest.
    const sink: unknown[] = [];

    _.all(values, (n) => n > 1); // you-dont-need-lodash-underscore/all
    _.any(values, (n) => n > 1); // you-dont-need-lodash-underscore/any
    _.assign({}, obj); // you-dont-need-lodash-underscore/assign
    _.bind(fn, obj); // you-dont-need-lodash-underscore/bind
    _.capitalize(text); // you-dont-need-lodash-underscore/capitalize
    _.castArray(text); // you-dont-need-lodash-underscore/cast-array
    _.collect(values, (n) => n + 1); // you-dont-need-lodash-underscore/collect
    _.concat(values, [1]); // you-dont-need-lodash-underscore/concat
    _.contains(values, 1); // you-dont-need-lodash-underscore/contains
    _.defaults({}, obj); // you-dont-need-lodash-underscore/defaults
    _.detect(values, (n) => n > 1); // you-dont-need-lodash-underscore/detect
    _.drop(values, 1); // you-dont-need-lodash-underscore/drop
    _.dropRight(values, 1); // you-dont-need-lodash-underscore/drop-right
    _.each(values, (n) => n); // you-dont-need-lodash-underscore/each
    _.endsWith(text, 'x'); // you-dont-need-lodash-underscore/ends-with
    _.entries(obj); // you-dont-need-lodash-underscore/entries
    _.every(values, (n) => n > 1); // you-dont-need-lodash-underscore/every
    _.extendOwn({}, obj); // you-dont-need-lodash-underscore/extend-own
    _.fill(values, 0); // you-dont-need-lodash-underscore/fill
    _.filter(values, (n) => n > 1); // you-dont-need-lodash-underscore/filter
    _.find(values, (n) => n > 1); // you-dont-need-lodash-underscore/find
    _.findIndex(values, (n) => n > 1); // you-dont-need-lodash-underscore/find-index
    _.first(values); // you-dont-need-lodash-underscore/first
    _.flatten(nested); // you-dont-need-lodash-underscore/flatten
    _.foldl(values, (sum, n) => sum + n, 0); // you-dont-need-lodash-underscore/foldl
    _.foldr(values, (sum, n) => sum + n, 0); // you-dont-need-lodash-underscore/foldr
    _.forEach(values, (n) => n); // you-dont-need-lodash-underscore/for-each
    _.get(obj, 'a.b'); // you-dont-need-lodash-underscore/get
    _.head(values); // you-dont-need-lodash-underscore/head
    _.includes(values, 1); // you-dont-need-lodash-underscore/includes
    _.indexOf(values, 1); // you-dont-need-lodash-underscore/index-of
    _.inject(values, (sum, n) => sum + n, 0); // you-dont-need-lodash-underscore/inject
    _.isArray(values); // you-dont-need-lodash-underscore/is-array
    _.isArrayBuffer(buffer); // you-dont-need-lodash-underscore/is-array-buffer
    _.isDate(date); // you-dont-need-lodash-underscore/is-date
    _.isFinite(count); // you-dont-need-lodash-underscore/is-finite
    _.isFunction(fn); // you-dont-need-lodash-underscore/is-function
    _.isInteger(count); // you-dont-need-lodash-underscore/is-integer
    _.isNaN(count); // you-dont-need-lodash-underscore/is-nan
    _.isNil(value); // you-dont-need-lodash-underscore/is-nil
    _.isNull(value); // you-dont-need-lodash-underscore/is-null
    _.isString(text); // you-dont-need-lodash-underscore/is-string
    _.isUndefined(value); // you-dont-need-lodash-underscore/is-undefined
    _.join(values, ','); // you-dont-need-lodash-underscore/join
    _.keys(obj); // you-dont-need-lodash-underscore/keys
    _.last(values); // you-dont-need-lodash-underscore/last
    _.lastIndexOf(values, 1); // you-dont-need-lodash-underscore/last-index-of
    _.map(values, (n) => n + 1); // you-dont-need-lodash-underscore/map
    _.omit(obj, 'a'); // you-dont-need-lodash-underscore/omit
    _.padEnd(text, 5); // you-dont-need-lodash-underscore/pad-end
    _.padStart(text, 5); // you-dont-need-lodash-underscore/pad-start
    _.pairs(obj); // you-dont-need-lodash-underscore/pairs
    _.reduce(values, (sum, n) => sum + n, 0); // you-dont-need-lodash-underscore/reduce
    _.reduceRight(values, (sum, n) => sum + n, 0); // you-dont-need-lodash-underscore/reduce-right
    _.repeat(text, 2); // you-dont-need-lodash-underscore/repeat
    _.replace(text, 'a', 'b'); // you-dont-need-lodash-underscore/replace
    _.reverse(values); // you-dont-need-lodash-underscore/reverse
    _.select(values, (n) => n > 1); // you-dont-need-lodash-underscore/select
    _.size(values); // you-dont-need-lodash-underscore/size
    _.slice(values, 1); // you-dont-need-lodash-underscore/slice
    _.some(values, (n) => n > 1); // you-dont-need-lodash-underscore/some
    _.split(text, ','); // you-dont-need-lodash-underscore/split
    _.startsWith(text, 'a'); // you-dont-need-lodash-underscore/starts-with
    _.takeRight(values, 1); // you-dont-need-lodash-underscore/take-right
    _.toLower(text); // you-dont-need-lodash-underscore/to-lower
    _.toPairs(obj); // you-dont-need-lodash-underscore/to-pairs
    _.toUpper(text); // you-dont-need-lodash-underscore/to-upper
    _.trim(text); // you-dont-need-lodash-underscore/trim
    _.unionBy(values, other, (n) => n); // you-dont-need-lodash-underscore/union-by
    _.values(obj); // you-dont-need-lodash-underscore/values

    // Negative controls: the native equivalents the rules point at. None of these may report on either tool,
    // so a rule that fires here is matching shape it should not.
    sink.push(values.every((n) => n > 1));
    sink.push(values.some((n) => n > 1));
    sink.push(values.filter((n) => n > 1));
    sink.push(values.map((n) => n + 1));
    sink.push(values.reduce((sum, n) => sum + n, 0));
    sink.push(values.reduceRight((sum, n) => sum + n, 0));
    sink.push(values.forEach((n) => n));
    sink.push(values.find((n) => n > 1));
    sink.push(values.findIndex((n) => n > 1));
    sink.push(values.at(0));
    sink.push(values.at(-1));
    sink.push(values.slice(1));
    sink.push(values.slice(0, -1));
    sink.push(values.indexOf(1));
    sink.push(values.lastIndexOf(1));
    sink.push(values.includes(1));
    sink.push(values.join(','));
    sink.push(values.concat([1]));
    sink.push(values.reverse());
    sink.push(Array.from(new Set(values)));
    sink.push(Object.keys(obj));
    sink.push(Object.values(obj));
    sink.push(Object.entries(obj));
    sink.push(Object.assign({}, obj));
    sink.push(value === null || value === undefined);
    sink.push(value === null);
    sink.push(value === undefined);
    sink.push(Array.isArray(values));
    sink.push(value instanceof ArrayBuffer);
    sink.push(date instanceof Date);
    sink.push(Number.isFinite(count));
    sink.push(Number.isInteger(count));
    sink.push(Number.isNaN(count));
    sink.push(typeof fn === 'function');
    sink.push(typeof text === 'string');
    sink.push(Array.isArray(text) ? text : [text]);
    sink.push(text.charAt(0).toUpperCase() + text.slice(1).toLowerCase());
    sink.push(text.startsWith('a'));
    sink.push(text.endsWith('x'));
    sink.push(text.toLowerCase());
    sink.push(text.toUpperCase());
    sink.push(text.trim());
    sink.push(text.padEnd(5));
    sink.push(text.padStart(5));
    sink.push(text.repeat(2));
    sink.push(text.replace('a', 'b'));
    sink.push(text.split(','));
    sink.push(sortBy);
    const {a, ...rest} = obj; // the native shape the omit rule asks for
    sink.push(a, rest);

    return sink;
}
