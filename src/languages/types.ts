import type en from './en';

type PluralForm = {
    zero?: string;
    one: string;
    two?: string;
    few?: (count: number) => string;
    many?: (count: number) => string;
    other: (count: number) => string;
};

/**
 * Translation value can be a string or a function that returns a string
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslationLeafValue = string | ((arg: any) => PluralForm | string);

/**
 * Translation object is a recursive object that can contain other objects or string/function values
 */
type TranslationDeepObject = {[key: string]: TranslationLeafValue | TranslationDeepObject};

const en2 = {
    test: 'lol',
    common: {
        yes: 'Yes',
        x: ({x}: {x: string}) => `You don't have permission to take this action for ${x} as a`,
        y: ({accountOwnerEmail}: {accountOwnerEmail: string}) => `You don't have permission to take this action for ${accountOwnerEmail} as a`,
        i: (x: number) => `You don't have permission to take this action for ${x} as a`,
    },
    receiptIssuesFound: () => ({
        one: `Issue found`,
        other: () => `Issues found`,
    }),
} satisfies TranslationDeepObject;
/**
 * Flattens an object and returns concatenations of all the keys of nested objects
 *
 * Ex:
 * Input: { common: { yes: "Yes", no: "No" }}
 * Output: "common.yes" | "common.no"
 */
type FlattenObject<TObject, TPrefix extends string = ''> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
type TranslationPath = FlattenObject<DefaultTranslation>;

/**
 * Flattened default translation object with its values
 */
type TranslationFlatObject = {
    [Path in TranslationPath]: TranslationValue<DefaultTranslation, Path>;
};

type PluralParameters = {
    count?: number;
};

type TranslationParameters<TPath extends TranslationPath> = TranslationFlatObject[TPath] extends (arg: infer A, ...args: unknown[]) => infer R
    ? R extends string
        ? [A]
        : R extends PluralForm
        ? [A & PluralParameters]
        : []
    : [];

// type PhraseParameters<T> = T extends (...args: infer A) => string ? A : never[];
// type Phrase<TKey extends TranslationPath> = TranslationFlatObject[TKey] extends (...args: infer A) => unknown ? (...args: A) => string : string;

export type {DefaultTranslation, TranslationDeepObject, TranslationPath, TranslationValue, TranslationFlatObject, TranslationParameters};
