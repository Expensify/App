import type {TranslationPaths} from '@src/languages/types';

/** The closed set of input kinds every schema-driven form renders through; the DynamicForm registry is exhaustive over it */
type DynamicFormFieldType = 'text' | 'select' | 'multiselect' | 'radio' | 'date' | 'country' | 'address' | 'boolean' | 'file' | 'amount';

/** One allowed value of a select, multiselect or radio field */
type DynamicFormFieldOption = {
    /** Value submitted to the server */
    key: string;

    /** The schema author's wording; shown when no labelKey */
    label?: string;

    /** Our translation; required for App-owned schemas, added by the server for keys it recognizes */
    labelKey?: TranslationPaths;
};

/** One field of a schema-driven form, as the server emits it or as an App-owned schema declares it */
type DynamicFormField = {
    /** Unique key within the form; also the Onyx draft key */
    key: string;

    /** The schema author's wording; shown when no labelKey */
    label?: string;

    /** Our translation; required for App-owned schemas, added by the server for keys it recognizes */
    labelKey?: TranslationPaths;

    /** Section name; pages are built from it */
    group: string;

    type: DynamicFormFieldType;

    required: boolean;

    /** Allowed values for select, multiselect and radio */
    values?: DynamicFormFieldOption[];

    /** Options filtered by another answer, keyed by that answer's value */
    dependsOn?: {
        key: string;
        valuesBy: Record<string, DynamicFormFieldOption[]>;
    };

    /** Maximum number of files for a file field */
    maxFiles?: number;

    regex?: string;

    minLength?: number;

    maxLength?: number;

    /** Sample value, shown as the placeholder */
    example?: string;

    displayFormat?: string;

    /** Re-fetch the form with the current answers when this field changes */
    refreshOnChange: boolean;

    /** Show only when another answer matches one of these values */
    showWhen?: {
        key: string;
        equals: string[];
    };
};

export type {DynamicFormField, DynamicFormFieldOption, DynamicFormFieldType};
