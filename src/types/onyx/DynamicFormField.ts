import type {TranslationPaths} from '@src/languages/types';

/** The closed set of input kinds every schema-driven form renders through; the DynamicForm registry is exhaustive over it */
type DynamicFormFieldType =
    | 'text'
    | 'number'
    | 'select'
    | 'multiselect'
    | 'radio'
    | 'date'
    | 'country'
    | 'countryMultiselect'
    | 'currency'
    | 'address'
    | 'boolean'
    | 'file'
    | 'amount'
    | 'percent'
    | 'list';

/** Keyboard to open for a text field on native and mobile web */
type DynamicFormKeyboard = 'email' | 'tel' | 'url' | 'numeric';

/** One allowed value of a select, multiselect or radio field */
type DynamicFormFieldOption = {
    /** Value submitted to the server */
    key: string;

    /** The schema author's wording; shown when no labelKey */
    label?: string;

    /** Our translation; required for App-owned schemas, added by the server for keys it recognizes */
    labelKey?: TranslationPaths;
};

/** A named check from ValidationUtils that a regex cannot express; each applies to one type */
type DynamicFormFieldRule = 'legalName' | 'dateOfBirth' | 'zipCode';

/** One field of a schema-driven form, as the server emits it or as an App-owned schema declares it */
type DynamicFormField = {
    /** Unique key within the form; also the Onyx draft key */
    key: string;

    /** The schema author's wording; shown when no labelKey */
    label?: string;

    /** Our translation; required for App-owned schemas, added by the server for keys it recognizes */
    labelKey?: TranslationPaths;

    /** Supporting text shown with the field, such as which documents are accepted */
    description?: string;

    descriptionKey?: TranslationPaths;

    /** Section identity; pages are built from it and it is the page title unless `groupLabelKey` is set */
    group: string;

    /** Our translation of the page title; required for App-owned schemas */
    groupLabelKey?: TranslationPaths;

    /** Sub-heading within the page; consecutive fields sharing it render under one bold title */
    section?: string;

    /** Our translation of the section title; required for App-owned schemas */
    sectionLabelKey?: TranslationPaths;

    type: DynamicFormFieldType;

    required: boolean;

    /** Allowed values for select, multiselect and radio */
    values?: DynamicFormFieldOption[];

    /** Select and radio only: draw the choice as a segmented tab row, for the switch that decides which fields follow */
    presentation?: 'tabs';

    /** Options filtered by another answer, keyed by that answer's value */
    dependsOn?: {
        key: string;
        valuesBy: Record<string, DynamicFormFieldOption[]>;
    };

    /** Maximum number of files for a file field */
    maxFiles?: number;

    regex?: string;

    /** legalName for text, dateOfBirth for date, zipCode for address; ignored on other types */
    rule?: DynamicFormFieldRule;

    minLength?: number;

    maxLength?: number;

    /** Sample value, shown as a hint */
    example?: string;

    /** Re-fetch the form with the current answers when this field changes */
    refreshOnChange: boolean;

    /** Show only when another answer matches one of these values */
    showWhen?: {
        key: string;
        equals: string[];
    };

    keyboard?: DynamicFormKeyboard;

    /** A text field that grows with its content, for descriptions */
    multiline?: boolean;

    /** Shown as a plain row with its prefilled value; never edited or validated */
    readonly?: boolean;

    /** Never written to the form draft, for SSNs and account numbers */
    sensitive?: boolean;

    /** Amount only: the sibling key that holds the chosen currency; without it the currency is fixed */
    currencyKey?: string;

    /** List only: the fields of one repeated item */
    itemFields?: DynamicFormField[];

    /** List only: the noun for one item, such as "owner", for the add row and the editor title */
    itemLabel?: string;

    itemLabelKey?: TranslationPaths;

    /** List only: hint shown under the add row */
    addItemDescription?: string;

    addItemDescriptionKey?: TranslationPaths;

    minItems?: number;

    maxItems?: number;
};

/** One entry of a list field; `id` is generated on the device for row keys */
type DynamicFormListItem = Record<string, unknown> & {id: string};

export type {DynamicFormField, DynamicFormFieldOption, DynamicFormFieldType, DynamicFormKeyboard, DynamicFormListItem};
