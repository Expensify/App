// One deliberate @typescript-eslint/naming-convention violation per selector group in
// eslint-config-expensify's options, plus controls that must stay silent on BOTH tools.
// This file is the only proof that hosting the rule with stubbed parser services behaves
// like ESLint: the rule reports zero findings repo-wide, so 0 = 0 proves nothing.

// violation: variable must be camelCase / UPPER_CASE / PascalCase
const snake_case_variable = 1;

// violation: function must be camelCase / PascalCase
export function snake_case_function() {
    return snake_case_variable;
}

// violation: typeLike must be PascalCase
export type lowercase_type = string;

// violation: enumMember must be PascalCase
export enum Direction {
    up_down = 'UP_DOWN',
}

// violation: parameter must be camelCase / PascalCase
export function withBadParameter(snake_param: number) {
    return snake_param;
}

// control: UPPER_CASE and camelCase variables are allowed
export const UPPER_CASE_OK = 2;
export const camelCaseOk = 3;

// control: PascalCase function is allowed
export function PascalCaseOk(): number {
    return UPPER_CASE_OK + camelCaseOk;
}

// control: a single leading underscore is allowed on parameters
export function withAllowedUnderscore(_leading: number) {
    return _leading;
}

// control: the first selector group exempts __esModule by filter
export const moduleFlag = {__esModule: true};

// violation: a property that requires quotes is still checked, because our options define no
// entry for the requiresQuotes modifier. This is the one case the stubbed compilerOptions.target
// could have changed the verdict, and both tools flag it identically.
export const quotedProperty = {'foo-bar': 4};
