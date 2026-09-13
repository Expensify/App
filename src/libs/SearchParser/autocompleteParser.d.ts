/**
 * Describes autocompleteParser.peggy and baseRules.peggy after parser-workletization.sh.
 * Keep this contract aligned with the shipped autocompleteParser.js when regenerating it.
 */
import type {SearchAutocompleteParserResult} from '@components/Search/types';

type ParserExpectation =
    | {type: 'literal'; text: string; ignoreCase: boolean}
    | {type: 'class'; parts: Array<string | [string, string]>; inverted: boolean; ignoreCase: boolean}
    | {type: 'any'}
    | {type: 'end'}
    | {type: 'other'; description: string};

type ParserPosition = {
    offset: number;
    line: number;
    column: number;
};

type ParserLocation = {
    source: unknown;
    start: ParserPosition;
    end: ParserPosition;
};

type ParserOptions = {
    startRule?: 'query' | '';
    grammarSource?: unknown;
    peg$currPos?: number;
    peg$silentFails?: number;
    peg$maxFailExpected?: ParserExpectation[];
    peg$library?: boolean;
};

type ParserLibraryResult = {
    peg$result: SearchAutocompleteParserResult;
    peg$currPos: number;
    peg$FAILED: Record<string, never>;
    peg$maxFailExpected: ParserExpectation[];
    peg$maxFailPos: number;
};

declare function parse(input: string, options?: ParserOptions & {peg$library?: false}): SearchAutocompleteParserResult;
declare function parse(input: string, options: ParserOptions & {peg$library: true}): ParserLibraryResult;
declare function parse(input: string, options?: ParserOptions): SearchAutocompleteParserResult | ParserLibraryResult;

/** Initially contains query. Mutating this list does not register additional parser rules. */
declare const StartRules: string[];

/** Workletization replaces the Error subclass with an empty constructor that ignores its arguments. */
declare class SyntaxError {
    constructor(message?: string, expected?: ParserExpectation[], found?: string | null, location?: ParserLocation);

    message?: string;

    expected?: ParserExpectation[];

    found?: string | null;

    location?: ParserLocation;

    format(sources: Array<{source: unknown; text: string}>): string;

    static buildMessage(expected: ParserExpectation[], found: string | null): string;
}

export {parse, StartRules, SyntaxError};
