import type {TranslationPaths} from '@src/languages/types';

import type {InputModeOptions} from 'react-native';

/** One allowed value of a select or radio field */
type DynamicFormFieldOption = {
    /** Value submitted to the server */
    key: string;

    /** The schema author's wording, shown when there is no labelKey */
    label?: string;

    labelKey?: TranslationPaths;
};

/** What every field type has in common */
type DynamicFormFieldBase = {
    /** Unique within the form, and the field's draft key */
    key: string;

    /** The schema author's wording, shown when there is no labelKey */
    label?: string;

    labelKey?: TranslationPaths;

    /** Supporting text, such as which format is accepted */
    description?: string;

    descriptionKey?: TranslationPaths;

    /** Consecutive fields sharing a section render under one title */
    section?: string;

    sectionLabelKey?: TranslationPaths;

    required: boolean;

    /** Shown as a plain row with its prefilled value, never edited or validated */
    readonly?: boolean;

    /** Never written to the form draft, for SSNs and account numbers */
    sensitive?: boolean;

    /** Shown only while another answer is one of these values */
    showWhen?: {
        key: string;
        equals: string[];
    };
};

/** Free text, checked by regex, length and an optional named rule */
type DynamicFormTextField = DynamicFormFieldBase & {
    type: 'text';
    regex?: string;
    minLength?: number;
    maxLength?: number;

    /** Sample value, shown as a hint and in the format error */
    example?: string;

    keyboard?: Extract<InputModeOptions, 'email' | 'tel' | 'url' | 'numeric'>;

    /** Grows with its content, for descriptions */
    multiline?: boolean;

    rule?: 'legalName';
};

/** Text that must parse as a finite number, typed on the numeric keyboard */
type DynamicFormNumberField = DynamicFormFieldBase & Pick<DynamicFormTextField, 'regex' | 'minLength' | 'maxLength' | 'example'> & {type: 'number'};

/** One answer out of a list of options */
type DynamicFormChoiceField = DynamicFormFieldBase & {
    type: 'select' | 'radio';
    values?: DynamicFormFieldOption[];

    /** Options picked by another answer, keyed by that answer's value. Takes the place of `values`. */
    dependsOn?: {
        key: string;
        valuesBy: Record<string, DynamicFormFieldOption[]>;
    };
};

/** A calendar date, stored as yyyy-MM-dd */
type DynamicFormDateField = DynamicFormFieldBase & {
    type: 'date';
    rule?: 'dateOfBirth';
};

/** A postal address. The street is the field's value; the other parts are stored under `<key>.<part>`. */
type DynamicFormAddressField = DynamicFormFieldBase & {
    type: 'address';
    rule?: 'zipCode';
};

/** Types that need nothing beyond the common properties */
type DynamicFormPlainField = DynamicFormFieldBase & {
    type: 'boolean' | 'country' | 'currency';
};

/** One field of a schema-driven form, as the server sends it or as an App-owned schema declares it */
type DynamicFormField = DynamicFormTextField | DynamicFormNumberField | DynamicFormChoiceField | DynamicFormDateField | DynamicFormAddressField | DynamicFormPlainField;

/** Every type the renderer and validator handle */
type DynamicFormFieldType = DynamicFormField['type'];

export type {
    DynamicFormAddressField,
    DynamicFormChoiceField,
    DynamicFormDateField,
    DynamicFormField,
    DynamicFormFieldOption,
    DynamicFormFieldType,
    DynamicFormNumberField,
    DynamicFormPlainField,
    DynamicFormTextField,
};
