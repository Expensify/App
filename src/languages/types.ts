/* eslint-disable @typescript-eslint/no-explicit-any */
import type en from './en';

type PluralParams = {count: number};
type PluralForm = {
    zero?: string;
    one: string;
    two?: string;
    few?: (count: number) => string;
    many?: (count: number) => string;
    other: (count: number) => string;
};

/**
 * Retrieves the first argument of a function
 */
type FirstArgument<TFunction> = TFunction extends (arg: infer A, ...args: any[]) => any ? A : never;

/**
 * Translation value can be a string or a function that returns a string
 */
type TranslationLeafValue<TStringOrFunction> = TStringOrFunction extends string
    ? string
    : (
          arg: FirstArgument<TStringOrFunction> extends Record<string, unknown> | undefined ? FirstArgument<TStringOrFunction> : Record<string, unknown>,
          ...noOtherArguments: unknown[]
      ) => string | PluralForm;

/**
 * Translation object is a recursive object that can contain other objects or string/function values
 */
type TranslationDeepObject<TTranslations = any> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Path in keyof TTranslations]: TTranslations[Path] extends string | ((...args: any[]) => any)
        ? TranslationLeafValue<TTranslations[Path]>
        : TTranslations[Path] extends number | boolean | null | undefined | unknown[]
        ? string
        : TranslationDeepObject<TTranslations[Path]>;
};

/**
 * Flattens an object and returns concatenations of all the keys of nested objects
 *
 * Ex:
 * Input: { common: { yes: "Yes", no: "No" }}
 * Output: "common.yes" | "common.no"
 */
type FlattenObject<TObject, TPrefix extends string = ''> = {
    [TKey in keyof TObject]: TObject[TKey] extends (arg: any) => any
        ? `${TPrefix}${TKey & string}`
        : // eslint-disable-next-line @typescript-eslint/ban-types
        TObject[TKey] extends object
        ? FlattenObject<TObject[TKey], `${TPrefix}${TKey & string}.`>
        : `${TPrefix}${TKey & string}`;
}[keyof TObject];

/**
 * Retrieves a type for a given key path (calculated from the type above)
 */
type TranslationValue<TObject, TPath extends string> = TPath extends keyof TObject
    ? TObject[TPath]
    : TPath extends `${infer TKey}.${infer TRest}`
    ? TKey extends keyof TObject
        ? TranslationValue<TObject[TKey], TRest>
        : never
    : never;

/**
 * English is the default translation, other languages will be type-safe based on this
 */
type DefaultTranslation = typeof en;

/**
 * Flattened default translation object
 */
type TranslationPaths = FlattenObject<DefaultTranslation>;

/**
 * Flattened default translation object with its values
 */
type FlatTranslationsObject = {
    [Path in TranslationPaths]: TranslationValue<DefaultTranslation, Path>;
};

/**
 * Determines the expected parameters for a specific translation function based on the provided translation path
 */
type TranslationParameters<TPath extends TranslationPaths> = FlatTranslationsObject[TPath] extends (...args: infer Args) => infer Return
    ? Return extends PluralForm
        ? Args[0] extends undefined
            ? [PluralParams]
            : [Args[0] & PluralParams]
        : Args
    : never[];

export type {DefaultTranslation, TranslationDeepObject, TranslationPaths, PluralForm, TranslationValue, FlatTranslationsObject, TranslationParameters};
