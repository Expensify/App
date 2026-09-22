/* eslint-disable @typescript-eslint/no-explicit-any */
import type en from './en';

type PluralParams = {count: number};
type PluralHandler = ((count: number) => string) | string;
type PluralForm = {
    zero?: string;
    one: string;
    two?: string;
    few?: PluralHandler;
    many?: PluralHandler;
    other: PluralHandler;
};

/**
 * Translation value can be a string or a function that returns a string.
 *
 * When the English entry returns a `PluralForm`, every other locale must return one too. Returning a
 * plain string there type-checks but silently disables pluralization: `getTranslatedPhrase` returns
 * the string before it ever selects a plural category, so that locale renders one fixed form for
 * every count. The `[Return] extends [PluralForm]` wrapper keeps the check non-distributive, so an
 * English entry that returns `string | PluralForm` stays permissive.
 *
 * The reverse is deliberately allowed: a locale may return a `PluralForm` where English returns a
 * plain string, since a language can need plural forms that English does not.
 */
type TranslationLeafValue<TStringOrFunction> = TStringOrFunction extends (...args: infer Args) => infer Return
    ? (...args: Args) => [Return] extends [PluralForm] ? PluralForm : string | PluralForm
    : string;

/**
 * Translation object is a recursive object that can contain other objects or string/function values
 */
type TranslationDeepObject<TTranslations = any> = {
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
    [TKey in keyof TObject]: TObject[TKey] extends (...args: any[]) => any
        ? `${TPrefix}${TKey & string}`
        : // eslint-disable-next-line @typescript-eslint/no-restricted-types
          TObject[TKey] extends object
          ? FlattenObject<TObject[TKey], `${TPrefix}${TKey & string}.`>
          : `${TPrefix}${TKey & string}`;
}[keyof TObject];

/**
 * Retrieves a type for a given key path (calculated from the type above)
 */
type TranslationValue<TObject, TKey extends string> = TKey extends keyof TObject
    ? TObject[TKey]
    : TKey extends `${infer TPathKey}.${infer TRest}`
      ? TPathKey extends keyof TObject
          ? TranslationValue<TObject[TPathKey], TRest>
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
type TranslationParameters<TKey extends TranslationPaths> = FlatTranslationsObject[TKey] extends (...args: infer Args) => infer Return
    ? Return extends PluralForm
        ? Args extends []
            ? [PluralParams]
            : Args extends [infer First, ...infer Rest]
              ? [First & PluralParams, ...Rest]
              : never
        : Args
    : never[];

export type {TranslationDeepObject, TranslationPaths, PluralForm, FlatTranslationsObject, TranslationParameters};
