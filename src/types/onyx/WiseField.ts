import type {TranslationPaths} from '@src/languages/types';

/** The closed set of input kinds every Wise-driven form renders through; the DynamicForm registry is exhaustive over it */
type WiseFieldType = 'text' | 'select' | 'multiselect' | 'radio' | 'date' | 'country' | 'address' | 'boolean' | 'file' | 'amount';

/** One allowed value of a select, multiselect or radio field */
type WiseFieldOption = {
    /** Value submitted to Wise */
    key: string;

    /** Wise's wording; shown when no labelKey */
    label?: string;

    /** Our translation; required for App-owned schemas, added by Auth for Wise keys it recognizes */
    labelKey?: TranslationPaths;
};

/** One field of a Wise form, as Auth emits it or as an App-owned schema declares it */
type WiseField = {
    /** Unique key within the form; also the Onyx draft key */
    key: string;

    /** Wise's wording; shown when no labelKey */
    label?: string;

    /** Our translation; required for App-owned schemas, added by Auth for Wise keys it recognizes */
    labelKey?: TranslationPaths;

    /** Wise's section name; pages are built from it */
    group: string;

    type: WiseFieldType;

    required: boolean;

    /** Allowed values for select, multiselect and radio */
    values?: WiseFieldOption[];

    /** Options filtered by another answer, keyed by that answer's value */
    dependsOn?: {
        key: string;
        valuesBy: Record<string, WiseFieldOption[]>;
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

export type {WiseField, WiseFieldOption, WiseFieldType};
