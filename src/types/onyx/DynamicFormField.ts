import type {FormValue} from '@components/Form/types';

import type {TranslationPaths} from '@src/languages/types';
import type {OnyxFormKey} from '@src/ONYXKEYS';

import type {InputModeOptions} from 'react-native';

/** One allowed value of a select or radio field */
type DynamicFormFieldOption = Pick<DynamicFormFieldBase, 'label' | 'labelKey'> & {
    /** Value submitted to the server */
    key: string;
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

    /** The page the field is asked on. Wise's requirement key, so fields sharing it are saved together. */
    group?: string;

    groupLabelKey?: TranslationPaths;

    /** Consecutive fields sharing a section render under one title */
    section?: string;

    sectionLabelKey?: TranslationPaths;

    required: boolean;

    /** Shown as a plain row with its prefilled value, never edited or validated */
    readonly?: boolean;

    /** Changing the answer changes which other fields are required, so the screen fetches the schema again */
    refreshOnChange?: boolean;

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

    rule?: 'legalName' | 'phone';

    /** Never written to the form draft, for SSNs and account numbers */
    sensitive?: boolean;
};

/** Text that must parse as a finite number, typed on the numeric keyboard */
type DynamicFormNumberField = DynamicFormFieldBase & Pick<DynamicFormTextField, 'regex' | 'minLength' | 'maxLength' | 'example' | 'sensitive'> & {type: 'number'};

/** One answer out of a list of options */
type DynamicFormChoiceField = DynamicFormFieldBase & {
    type: 'select' | 'radio';
    values?: DynamicFormFieldOption[];

    /** Draw the options as a segmented tab row, for the few-option switch that decides which fields follow */
    presentation?: 'tabs';

    /** Options picked by another answer, keyed by that answer's value. Takes the place of `values`. */
    dependsOn?: {
        key: string;
        valuesBy: Record<string, DynamicFormFieldOption[]>;
    };
};

/** Any number of answers out of a list of options */
type DynamicFormMultiChoiceField = DynamicFormFieldBase & Pick<DynamicFormChoiceField, 'values' | 'dependsOn'> & {type: 'multiselect'};

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

/** Uploaded documents */
type DynamicFormFileField = DynamicFormFieldBase & {
    type: 'file';
    maxFiles?: number;
};

/** A money amount */
type DynamicFormAmountField = DynamicFormFieldBase & {
    type: 'amount';

    /** Draft key of the currency the user picks next to the amount. Without it the currency is fixed by the screen. */
    currencyKey?: string;
};

/** One country, or any number of countries, picked from every country the App knows */
type DynamicFormCountryField = DynamicFormFieldBase & {
    type: 'country' | 'countryMultiselect';
};

/** A Yes/No question when it is the only question on its page, where No is an answer too. Among other fields, a checkbox that must be ticked when required. */
type DynamicFormBooleanField = DynamicFormFieldBase & {
    type: 'boolean';
};

/** Repeated entries, such as a company's owners, each answered with its own fields on an editor page */
type DynamicFormListField = DynamicFormFieldBase & {
    type: 'list';

    /** The fields of one entry */
    itemFields: DynamicFormField[];

    /** The noun for one entry, such as "owner", for the add row and the editor title */
    itemLabel?: string;

    itemLabelKey?: TranslationPaths;

    /** Hint shown under the add row */
    addItemDescription?: string;

    addItemDescriptionKey?: TranslationPaths;

    minItems?: number;
    maxItems?: number;
};

/** Types that need nothing beyond the common properties */
type DynamicFormPlainField = DynamicFormFieldBase & {
    type: 'currency' | 'percent';
};

/** One field of a schema-driven form, as the server sends it or as an App-owned schema declares it */
type DynamicFormField =
    | DynamicFormTextField
    | DynamicFormNumberField
    | DynamicFormChoiceField
    | DynamicFormMultiChoiceField
    | DynamicFormDateField
    | DynamicFormAddressField
    | DynamicFormFileField
    | DynamicFormAmountField
    | DynamicFormCountryField
    | DynamicFormBooleanField
    | DynamicFormListField
    | DynamicFormPlainField;

/** One entry of a list field: its answers keyed by item field key, and an `id` made on the device to key the entry's row and editor page */
type DynamicFormListItem = {
    id: string;
    [fieldKey: string]: FormValue | undefined;
};

/** A field as the schema sends it, which can be of a type this App version does not know */
type DynamicFormSchemaField = DynamicFormField | (DynamicFormFieldBase & {type: string});

/** Answers to sensitive fields, keyed by form ID, then by field key. Kept in memory only, never in a draft. */
type DynamicFormSensitiveAnswers = Partial<Record<OnyxFormKey, Record<string, string>>>;

/** Every type the renderer and validator handle */
type DynamicFormFieldType = DynamicFormField['type'];

export type {
    DynamicFormAddressField,
    DynamicFormAmountField,
    DynamicFormBooleanField,
    DynamicFormChoiceField,
    DynamicFormCountryField,
    DynamicFormFileField,
    DynamicFormListField,
    DynamicFormListItem,
    DynamicFormMultiChoiceField,
    DynamicFormDateField,
    DynamicFormField,
    DynamicFormFieldOption,
    DynamicFormFieldType,
    DynamicFormNumberField,
    DynamicFormPlainField,
    DynamicFormSchemaField,
    DynamicFormSensitiveAnswers,
    DynamicFormTextField,
};
