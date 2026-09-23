// tsBatch part A: the declaration- and syntax-level half of the typescript/* parity batch.
// One violation per rule, each followed by a control that must stay quiet, so a row cannot pass
// just because the file always reports. Everything here has to type-check under fixtures/tsconfig.json:
// a file that fails to type would let a typed rule report nothing and still look green.
// Types come from fixtures/tsBatchB.ts, the module this one imports and re-exports.
/// <reference path="./tsBatchB.ts" />

import type {BatchControl, BatchShape} from './tsBatchB';

import {BatchAliasType} from './tsBatchB';
import {type BatchInlineType} from './tsBatchB';
// consistent-type-imports: BatchTypeOnly is imported in value position but only ever used as a type.
// It has to be a symbol this file does NOT re-export: `export {BatchAliasType}` below is a value use,
// which is why the import on the line above stays silent on both tools.
import {BatchTypeOnly} from './tsBatchB';

export {BatchAliasType};
export type {BatchControl};

export function consumeText(value: string): void {
    void value;
}

// triple-slash-reference: the directive above is the violation (production default path: 'never').

declare const shape: BatchShape;
declare const aliased: BatchAliasType;
// control: the `import type` form above.
declare const alias: BatchInlineType;
// no-import-type-side-effects: every specifier is an inline `type`, so a runtime import survives.
declare const control: BatchControl;

// consistent-type-exports: the `export {BatchAliasType}` above re-exports a type without `type`.
export function useTypes(): string {
    return `${shape.id}${aliased.alias}${alias.inline}${control.flag}`;
}

// adjacent-overload-signatures: the second `interleaved` signature is split from the first.
declare function interleaved(input: string): string;
declare function unrelated(input: string): string;
declare function interleaved(input: number): number;
// control: consecutive overloads.
declare function consecutive(input: string): string;
declare function consecutive(input: number): number;

// array-type with production's array-simple: a simple type must be written string[].
export const boxedNames: Array<string> = [];
// control: array-simple keeps Array<> for types that are not simple.
export const boxedUnions: Array<BatchShape | null> = [];

// ban-ts-comment: a bare @ts-expect-error needs a description.
// @ts-expect-error
const suppressed: number = 'text';
// control: description present.
// @ts-expect-error: intentionally a string here
const described: number = 'other';

// ban-tslint-comment
// tslint:disable-next-line:no-console
export const linted = suppressed + described;

// class-literal-property-style ('fields'): a literal belongs in a field, not a getter.
export class LiteralGetter {
    readonly fixed = 2;

    get value(): number {
        return 1;
    }
}

// consistent-generic-constructors ('constructor'): type arguments belong on the constructor.
const entries: [string, number][] = [['alpha', 1]];
export const annotatedMap: Map<string, number> = new Map(entries);
// control: type arguments on the constructor call.
export const constructedMap = new Map<string, number>(entries);

// consistent-indexed-object-style ('record'): an index signature should be a Record.
export type IndexedStyle = {[key: string]: number};
// control: Record form.
export type RecordStyle = Record<string, number>;

// consistent-type-assertions ('as'): angle-bracket assertion.
declare const unknownValue: unknown;
export const angleCast = <string>unknownValue;
// control: as-cast.
export const asCast = unknownValue as string;

// consistent-type-definitions ('type'): an interface where a type alias is expected.
export type DefinedAlias = {alpha: string};
// control: the type alias above; every other interface in this file is also counted.
export interface DefinedInterface {
    alpha: string;
}

// no-confusing-non-null-assertion: the assertion reads like part of the comparison.
declare const maybeText: string | undefined;
export const confusingEquality = maybeText! === 'text';
// control: assertion outside the comparison.
export const clearEquality = (maybeText ?? '') === 'text';

// no-duplicate-enum-values
export enum DuplicatedEnum {
    First = 1,
    Second = 1,
}
// control
export enum UniqueEnum {
    First = 1,
    Second = 2,
}

// no-duplicate-type-constituents with production's ignoreUnions: intersections only. Two violations:
// the primitive intersection both tools agree on, and the structurally identical object literals that
// only ESLint catches -- see whyOxlintLines on the manifest entry.
export type IntersectedPrimitiveTwice = string & string;
export type IntersectedTwice = {id: string} & {id: string};
// control: unions are ignored by the production option.
export type UnionTwice = 'a' | 'a';

// no-empty-object-type
export type EmptyType = {};
// control
export type FullType = {alpha: string};

// no-inferrable-types
export const inferredCount: number = 5;
// control: an initializer that is not a literal keeps the annotation useful.
export const computedCount: number = Number('1');

// no-explicit-any
export function takesAny(input: any): void {
    void input;
} // control
export function takesUnknown(input: unknown): void {
    void input;
}

// no-extra-non-null-assertion
export const doubleAsserted = maybeText!!;
// no-non-null-assertion reports the same expression once more; its own violation is below.
// control for the extra assertion: a single assertion.

// no-non-null-assertion
export const assertedLength = maybeText!.length;
// control
export const guardedLength = (maybeText ?? '').length;

// no-misused-new: an interface cannot be constructed.
export interface ConstructedInterface {
    new (): ConstructedInterface;
}
// control: a construct signature for another type.
export interface BuilderInterface {
    new (): BuiltClass;
}
export class BuiltClass {
    value = 1;
}

// no-namespace
export namespace LegacyNamespace {
    export const marker = 1;
}
// control: global augmentation is exempt on both tools.
declare global {
    interface GlobalMarker {
        marker: boolean;
    }
}

// prefer-namespace-keyword: `module` instead of `namespace`.
export module LegacyModule {
    export const marker = 2;
}

// no-restricted-types with production's {object: ...}
export function takesObject(input: object): void {
    void input;
}
// control
export function takesRecord(input: Record<string, unknown>): void {
    void input;
}

// no-this-alias
export class AliasingClass {
    value = 1;

    sum(): number {
        const self = this;
        // control: destructuring and arrow functions are allowed by the default options.
        const {value} = this;
        const read = () => this.value;
        return self.value + value + read();
    }
}

// no-unnecessary-type-constraint: `extends unknown` is the implicit constraint.
export function unconstrained<T extends unknown>(value: T): T {
    return value;
}
// control
export function constrained<T extends string>(value: T): T {
    return value;
}

// no-unsafe-declaration-merging: a class merged with an interface.
export interface MergedInterface {
    flag: boolean;
}
export class MergedInterface {
    value = 1;
}
// control: interface with interface merging is safe.
export interface SafeInterface {
    alpha: string;
}
export interface SafeInterface {
    beta: string;
}

// no-wrapper-object-types
export let wrappedString: String = 'text';
// control
export let plainString: string = 'text';

// non-nullable-type-assertion-style: `as string` on a nullable value should be `!`.
export const narrowedCast = maybeText as string;
// control
export const narrowedRecord = maybeText ?? '';

// prefer-as-const
export let assertedLiteral = 'up' as 'up';
// control
export let constLiteral = 'up' as const;

// prefer-enum-initializers: `Pending` has no initializer.
export enum PartiallyInitialized {
    Ready = 1,
    Pending,
}
// control
export enum FullyInitialized {
    Ready = 1,
    Pending = 2,
}

// prefer-for-of
declare const words: string[];
export function indexLoop(): void {
    for (let index = 0; index < words.length; index += 1) {
        consumeText(words[index]);
    }
    // control
    for (const word of words) {
        consumeText(word);
    }
}

// prefer-function-type: a type literal with a single call signature.
export type CallableLiteral = {(value: string): void};
// control
export type CallableArrow = (value: string) => void;

// prefer-string-starts-ends-with
declare const sentence: string;
export function startsWithIndexOf(): boolean {
    return sentence.indexOf('prefix') === 0;
}
// control
export function startsWithMethod(): boolean {
    return sentence.startsWith('prefix');
}

export type BatchTypeOnlyAlias = BatchTypeOnly;
