/**
 * @jest-environment node
 */
import {execSync} from 'child_process';
import path from 'path';

const SCRIPT_PATH = path.resolve(__dirname, '../../.github/scripts/parseAndCollectJSONs.rb');

function runScript(input: string): unknown[] {
    const result = execSync(`ruby ${SCRIPT_PATH} '${input}'`, {
        encoding: 'utf-8',
    });
    return JSON.parse(result) as unknown[];
}

describe('Test if parseAndCollectJSONs works correctly', () => {
    test('returns empty array if no JSON objects present', () => {
        const result = runScript('hello world without json');
        expect(result).toEqual([]);
    });

    test('extracts single JSON object', () => {
        const json = '{"foo": "bar"}';
        const result = runScript(`Some text ${json} more text`);
        expect(result).toEqual([{foo: 'bar'}]);
    });

    test('extracts multiple JSON objects', () => {
        const text = `prefix {"a":1} middle {"b":2} end`;
        const result = runScript(text);
        expect(result).toEqual([{a: 1}, {b: 2}]);
    });

    test('ignores invalid JSON objects and parses valid ones', () => {
        const text = `some {invalid json} text {"valid": 123}`;
        const result = runScript(text);
        expect(result).toEqual([{valid: 123}]);
    });

    test('handles nested JSON correctly', () => {
        const text = `start {"outer": {"inner": 42}} end`;
        const result = runScript(text);
        expect(result).toEqual([{outer: {inner: 42}}]);
    });
});
