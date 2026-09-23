// tsBatch part B: the type-aware half of the typescript/* parity batch, plus the module tsBatchA.ts
// imports its types from. Same rule as part A: one violation per rule with a control beside it, and
// nothing here may fail to type-check, because untyped code makes typed rules silently quiet.

export type BatchShape = {id: string};
export type BatchControl = {flag: boolean};
export type BatchAliasType = {alias: string};
export type BatchInlineType = {inline: boolean};

export function consumeNumber(value: number): void {
    void value;
}

// await-thenable: awaiting something that is not a thenable.
declare const plainNumber: number;
export async function awaitNonThenable(): Promise<void> {
    const value = await plainNumber;
    consumeNumber(value);
}
// control: a real promise.
export async function awaitThenable(promise: Promise<number>): Promise<void> {
    const value = await promise;
    consumeNumber(value);
}

// dot-notation with production's allowKeywords
export type ConfigShape = {alpha: number; default: string};
declare const configValue: ConfigShape;
export const bracketed = configValue['alpha'];
// control: a keyword property may stay in brackets.
export const keywordAccess = configValue['default'];
// control: dot access.
export const dotted = configValue.alpha;

// no-array-delete
declare const list: (string | undefined)[];
export function removeFirstItem(): void {
    delete list[0];
}
// control: deleting a record key is fine.
declare const registry: Record<string, number>;
export function removeRegistryEntry(): void {
    delete registry.alpha;
}

// no-base-to-string: the class has no useful toString.
export class SilentBox {
    value = 1;
}
export const stringifySilent = String(new SilentBox());
// control
export class TalkativeBox {
    value = 1;

    toString(): string {
        return 'talkative';
    }
}
export const stringifyTalkative = String(new TalkativeBox());

// no-for-in-array
declare const names: string[];
export function loopArrayWithIn(): void {
    for (const key in names) {
        consumeTextKey(key);
    }
}
function consumeTextKey(key: string): void {
    void key;
}
// control: for-in over a record.
declare const lookup: Record<string, string>;
export function loopRecordWithIn(): void {
    for (const key in lookup) {
        consumeTextKey(lookup[key]);
    }
}

// no-implied-eval: a string handler reaches the timer.
export function scheduleBad(): void {
    setTimeout('consumeNumber(1)', 100);
}
// control: a function handler.
export function scheduleGood(): void {
    setTimeout(() => consumeNumber(1), 100);
}

// no-non-null-asserted-optional-chain
export type NestedShape = {inner?: {name: string}};
declare const nested: NestedShape;
export const assertedChain = nested.inner?.name!;
// control
export const defaultedChain = nested.inner?.name ?? 'fallback';

// no-redundant-type-constituents: the literal is swallowed by string.
export type RedundantUnion = 'a' | string;
// control
export type WidenedUnion = 'a' | 'b';

// no-unsafe-argument: JSON.parse hands back any.
declare function takesNumber(input: number): void;
export function passParsed(): void {
    takesNumber(JSON.parse('1'));
}
// control
export function passLiteral(): void {
    takesNumber(1);
}

// no-unsafe-call
export function callParsed(): unknown {
    return JSON.parse('null')();
}
// control
declare const typedCallback: () => void;
export function callTyped(): void {
    typedCallback();
}

// no-unsafe-enum-comparison
export enum Level {
    Low = 0,
    High = 1,
}
declare const levelNumber: number;
export const lowByNumber = levelNumber === Level.Low;
// control
export const lowByLevel = Level.Low === Level.Low;

// no-unsafe-function-type
export function applyLoose(callback: Function): void {
    void callback;
}
// control
export function applyTyped(callback: () => void): void {
    void callback;
}

// no-unsafe-unary-minus: TypeScript allows unary minus on any enum type, so a string enum member is
// the one shape that negates a non-number without tsc catching it first. `any` does NOT report:
// it is assignable to number, so the rule stays silent and the row would prove nothing.
enum UnaryStringEnum {
    Alpha = 'alpha',
}
export const negatedStringEnum = -UnaryStringEnum.Alpha;
// control
export function negateNumber(): number {
    return -plainNumber;
}

// prefer-nullish-coalescing with production's ignoreIfStatements/ignoreTernaryTests
declare const maybeLabel: string | undefined;
export const labelOr = maybeLabel || 'fallback';
// control: the operator the rule asks for.
export const labelNullish = maybeLabel ?? 'fallback';
// control: ternary tests are ignored by the production option.
export const labelTernary = maybeLabel ? maybeLabel : 'fallback';
// control: if statements are ignored by the production option.
export function useLabel(): void {
    if (maybeLabel) {
        consumeTextKey(maybeLabel);
    }
}

// restrict-plus-operands: string plus object. typescript-eslint v8 defaults allow number, boolean and
// any on the other side of a string, so those shapes report on neither tool; an object still does.
declare const boxedValue: {id: string};
export const objectPlus = 'text-' + boxedValue;
// control
export const stringPlus = 'text-' + 'more';
// control: allowed by the v8 default allowNumberAndString, and the reason the number shape is not the violation.
export const numberPlus = 'text-' + plainNumber;

// restrict-template-expressions: an object interpolates as [object Object]. The v8 defaults turned
// allowNullish/allowBoolean/allowAny on, so those shapes are silent on both tools and only an
// object (or never) still reports.
export const renderedObject = `label: ${boxedValue}`;
// control: numbers are allowed by the defaults.
export const renderedNumber = `count: ${plainNumber}`;
// control: nullish is allowed by the v8 defaults, and the reason it is not the violation here.
export const renderedNullable = `label: ${maybeLabel}`;

// return-await ('in-try-catch'): outside try/catch the await is unnecessary.
export async function unnecessaryAwait(promise: Promise<number>): Promise<number> {
    return await promise;
}
// control: inside try the await is required by the mode.
export async function neededAwait(promise: Promise<number>): Promise<number> {
    try {
        return await promise;
    } catch {
        return 0;
    }
}

// switch-exhaustiveness-check with considerDefaultExhaustiveForUnions
export type Kind = 'first' | 'second' | 'third';
declare const kind: Kind;
export function describeKind(): void {
    switch (kind) {
        case 'first':
            consumeTextKey('first');
            break;
        case 'second':
            consumeTextKey('second');
            break;
    }
}
// control: considerDefaultExhaustiveForUnions makes a defaulted switch exhaustive on both tools.
export function describeKindWithDefault(): void {
    switch (kind) {
        case 'first':
            consumeTextKey('first');
            break;
        default:
            break;
    }
}

// unbound-method
export class Service {
    value = 1;

    run(): number {
        return this.value;
    }
}
declare const service: Service;
export const detachedRun = service.run;
// control
export const boundRun = service.run.bind(service);

// The type below exists only so tsBatchA can import it in value position for consistent-type-imports.
export type BatchTypeOnly = {typeOnly: string};
