import type en from './en';

type PluralForm = {
    one: string;
    other: string;
    zero?: string;
    two?: string;
    few?: string;
    many?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/* Flat Translation Object types */
// Flattens an object and returns concatenations of all the keys of nested objects
type FlattenObject<TObject, TPrefix extends string = ''> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [TKey in keyof TObject]: TObject[TKey] extends (args: any) => any
        ? `${TPrefix}${TKey & string}`
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        TObject[TKey] extends any[]
        ? `${TPrefix}${TKey & string}`
        : // eslint-disable-next-line @typescript-eslint/ban-types
        TObject[TKey] extends object
        ? FlattenObject<TObject[TKey], `${TPrefix}${TKey & string}.`>
        : `${TPrefix}${TKey & string}`;
}[keyof TObject];

// Retrieves a type for a given key path (calculated from the type above)
type TranslateType<TObject, TPath extends string> = TPath extends keyof TObject
    ? TObject[TPath]
    : TPath extends `${infer TKey}.${infer TRest}`
    ? TKey extends keyof TObject
        ? TranslateType<TObject[TKey], TRest>
        : never
    : never;

type EnglishTranslation = typeof en;

type TranslationPaths = FlattenObject<EnglishTranslation>;

type TranslationFlatObject = {
    [TKey in TranslationPaths]: TranslateType<EnglishTranslation, TKey>;
};

export type {TranslationDeepObject, TranslationFlatObject, TranslationPaths, PluralForm};
