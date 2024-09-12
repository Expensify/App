/* eslint-disable @typescript-eslint/no-explicit-any */
import type AssertTypesEqual from '@src/types/utils/AssertTypesEqual';
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
type TranslationDeepObject<TTranslations> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Path in keyof TTranslations]: TTranslations[Path] extends string | ((...args: any[]) => any) ? TranslationLeafValue<TTranslations[Path]> : TranslationDeepObject<TTranslations[Path]>;
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

type TranslationParameters<TPath extends TranslationPaths> = FlatTranslationsObject[TPath] extends (...args: infer Args) => infer Return
    ? Return extends PluralForm
        ? Args[0] extends undefined
            ? [PluralParams]
            : [Args[0] & PluralParams]
        : Args
    : never[];

export type {DefaultTranslation, TranslationDeepObject, TranslationPaths, TranslationValue, FlatTranslationsObject, TranslationParameters, PluralForm};

/**
 * Check all translations that are functions to make sure they have a valid argument
 *
 * The argument must be an defined object or undefined
 *
 * Example:
 * {
 *   // This is valid because the argument is defined
 *   content: ({content}: ReportContentArgs) => `This is the content: ${content}`,
 *
 *   // This is invalid because the argument is not defined
 *   content: ({content}) => `This is the content: ${content}`,
 *
 *   // This is invalid because the argument is not an object
 *   content: (content: string) => `This is the content: ${content}`,
 * }
 */
type InvalidFunctionTranslations = {
    [Path in keyof FlatTranslationsObject]: FlatTranslationsObject[Path] extends infer Value
        ? Value extends (...args: any[]) => any
            ? Parameters<Value>[0] extends Record<string, unknown> | undefined
                ? never
                : Path
            : never
        : never;
}[keyof FlatTranslationsObject];

type TranslationArgumentShouldBeObjectError =
    "ERROR: The argument of a translation function must be an object. The keys highlighted in 'InvalidFunctionTranslations' type have invalid function parameter.";

/** If this type errors, it means that the translation functions have invalid arguments,  */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type AssertTranslations = AssertTypesEqual<never, InvalidFunctionTranslations, TranslationArgumentShouldBeObjectError>;
