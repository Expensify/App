import type {FormValue} from '@components/Form/types';

import type {TranslationPaths} from '@src/languages/types';
import type {OnyxFormKey} from '@src/ONYXKEYS';

import type {InputModeOptions} from 'react-native';

/** Met while the answer to `key` is one of `equals` */
type DynamicFormCondition = {
    /** Key of the field whose answer is checked */
    key: string;

    /** Answers that meet the condition. A boolean answer matches as `'true'` or `'false'`, and a list answer matches when any chosen value is listed. */
    equals: string[];
};

/** A title between fields in a page's content. It has no `type`, which is what tells it apart from a field. */
type DynamicFormHeading = {
    /** Can match a field's key, since headings and fields are told apart by `type` */
    key: string;

    /** The schema author's wording, shown when there is no titleKey */
    title?: string;

    /** Translation of `title`, used instead of it when set */
    titleKey?: TranslationPaths;

    /** The schema author's wording, shown when there is no descriptionKey */
    description?: string;

    /** Translation of `description`, used instead of it when set */
    descriptionKey?: TranslationPaths;

    /** Hides the title only. The fields after it still show, since a heading marks a place rather than containing fields. */
    showWhen?: DynamicFormCondition;
};

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

    /** Translation of `label`, used instead of it when set */
    labelKey?: TranslationPaths;

    /** Supporting text, such as which format is accepted */
    description?: string;

    /** Translation of `description`, used instead of it when set */
    descriptionKey?: TranslationPaths;

    /** The headline of a page with no title of its own where this is the only question, such as "What's your account number?". It also names that page's section on the confirmation page. */
    question?: string;

    /** Translation of `question`, used instead of it when set */
    questionKey?: TranslationPaths;

    /** The form cannot move on until the field is answered */
    required: boolean;

    /** Never written to the form draft, for SSNs and account numbers */
    sensitive?: boolean;

    /** Shown as a plain row with its prefilled value, never edited or validated */
    readonly?: boolean;

    /** Changing the answer changes which other fields are required, so the screen fetches the schema again */
    refreshOnChange?: boolean;

    /** Shown only while the condition is met */
    showWhen?: DynamicFormCondition;
};

/** Free text, checked by regex, length and an optional named rule */
type DynamicFormTextField = DynamicFormFieldBase & {
    /** Tells the field types apart */
    type: 'text';

    /** Pattern the answer must match, anchored by the schema when the whole answer must fit. An invalid pattern is reported and skipped, so it never blocks the user. */
    regex?: string;

    /** Fewest characters the answer can have */
    minLength?: number;

    /** Most characters the answer can have. The input stops taking more. */
    maxLength?: number;

    /** Sample value, shown as a hint and in the format error */
    example?: string;

    /** Keyboard the input opens. Without it, `rule: 'phone'` opens the phone keyboard and a digits-only `regex` the numeric one. */
    keyboard?: Extract<InputModeOptions, 'email' | 'tel' | 'url' | 'numeric'>;

    /** Grows with its content, for descriptions */
    multiline?: boolean;

    /** A named check on top of the others: `legalName` for a person's legal name, `phone` for an international phone number */
    rule?: 'legalName' | 'phone';
};

/** Text that must parse as a finite number, typed on the numeric keyboard */
type DynamicFormNumberField = DynamicFormFieldBase & Pick<DynamicFormTextField, 'regex' | 'minLength' | 'maxLength' | 'example'> & {type: 'number'};

/** One answer out of a list of options */
type DynamicFormChoiceField = DynamicFormFieldBase & {
    /** `select` picks from a dropdown or a searchable list, `radio` shows every option as a radio button */
    type: 'select' | 'radio';

    /** The options to pick from */
    values?: DynamicFormFieldOption[];

    /** Draw the options as a segmented tab row, for the few-option switch that decides which fields follow */
    presentation?: 'tabs';

    /** Options picked by another answer, keyed by that answer's value. Takes the place of `values`. */
    dependsOn?: {
        /** Key of the field whose answer picks the options */
        key: string;

        /** The options for each answer of that field. An answer missing here leaves no options. */
        valuesBy: Record<string, DynamicFormFieldOption[]>;
    };
};

/** Any number of answers out of a list of options */
type DynamicFormMultiChoiceField = DynamicFormFieldBase & Pick<DynamicFormChoiceField, 'values' | 'dependsOn'> & {type: 'multiselect'};

/** A calendar date, stored as yyyy-MM-dd */
type DynamicFormDateField = DynamicFormFieldBase & {
    /** Tells the field types apart */
    type: 'date';

    /** `dateOfBirth` takes only a past date within the allowed age range */
    rule?: 'dateOfBirth';
};

/** A postal address. The street is the field's value, and the other parts are stored under `<key>.<part>`. */
type DynamicFormAddressField = DynamicFormFieldBase & {
    /** Tells the field types apart */
    type: 'address';

    /** Checks the zip against the format of the chosen country */
    rule?: 'zipCode';
};

/** Uploaded documents */
type DynamicFormFileField = DynamicFormFieldBase & {
    /** Tells the field types apart */
    type: 'file';

    /** One file when not set */
    maxFiles?: number;

    /** Largest size of one file, in bytes. The form-wide limit applies when not set. */
    maxFileSize?: number;
};

/** A money amount */
type DynamicFormAmountField = DynamicFormFieldBase & {
    /** Tells the field types apart */
    type: 'amount';

    /** Draft key of the currency the user picks next to the amount. Without it the currency is fixed by the screen. */
    currencyKey?: string;
};

/** One country, or any number of countries, picked from every country the App knows */
type DynamicFormCountryField = DynamicFormFieldBase & {
    /** `country` picks one country, `countryMultiselect` any number of them */
    type: 'country' | 'countryMultiselect';
};

/** A Yes/No question, where No is an answer too, or a checkbox that must be ticked when required */
type DynamicFormBooleanField = DynamicFormFieldBase & {
    /** Tells the field types apart */
    type: 'boolean';

    /** `yesNo`, the default, asks a question that No answers. `checkbox` asks for consent, such as accepting terms, which only a tick gives. */
    presentation?: 'yesNo' | 'checkbox';
};

/** Repeated entries, such as a company's owners, each answered with its own fields on an editor page */
type DynamicFormListField = DynamicFormFieldBase & {
    /** Tells the field types apart */
    type: 'list';

    /** The fields of one entry */
    itemFields: DynamicFormField[];

    /** The noun for one entry, such as "owner", for the add row and the editor title */
    itemLabel?: string;

    /** Translation of `itemLabel`, used instead of it when set */
    itemLabelKey?: TranslationPaths;

    /** Hint shown under the add row */
    addItemDescription?: string;

    /** Translation of `addItemDescription`, used instead of it when set */
    addItemDescriptionKey?: TranslationPaths;

    /** Fewest entries the list must hold to pass validation */
    minItems?: number;

    /** Most entries the list can hold. The add row is hidden once it is reached. */
    maxItems?: number;
};

/** Types that need nothing beyond the common properties */
type DynamicFormPlainField = DynamicFormFieldBase & {
    /** `currency` picks a currency code, `percent` takes a percentage from 1 to 100 */
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
    /** Made on the device when the entry is added, and keys the entry's row, editor page and sensitive answers */
    id: string;

    /** The entry's answers, keyed by item field key */
    [fieldKey: string]: FormValue | undefined;
};

/** A field as the schema sends it, which can be of a type this App version does not know */
type DynamicFormSchemaField = DynamicFormField | (DynamicFormFieldBase & {type: string});

/** A heading or a field of a page */
type DynamicFormContentItem = DynamicFormHeading | DynamicFormSchemaField;

/** A page of a multi-page form. It is a heading with its own content, so it can carry a title, a description and a `showWhen`. */
type DynamicFormPage = DynamicFormHeading & {
    /** The headings and fields shown on this page */
    content: DynamicFormContentItem[];
};

/** What a multi-page form is built from: pages as the server groups them, or a flat list of fields the App paginates */
type DynamicFormSchema = {pages: DynamicFormPage[]} | {fields: DynamicFormSchemaField[]};

/** Answers to sensitive fields, keyed by form ID, then by field key. Kept in memory only, never in a draft. */
type DynamicFormSensitiveAnswers = Partial<Record<OnyxFormKey, Partial<Record<string, FormValue>>>>;

/** Every type the renderer and validator handle */
type DynamicFormFieldType = DynamicFormField['type'];

export type {
    DynamicFormAddressField,
    DynamicFormChoiceField,
    DynamicFormContentItem,
    DynamicFormCountryField,
    DynamicFormField,
    DynamicFormFieldOption,
    DynamicFormFieldType,
    DynamicFormHeading,
    DynamicFormListField,
    DynamicFormListItem,
    DynamicFormMultiChoiceField,
    DynamicFormNumberField,
    DynamicFormPage,
    DynamicFormSchema,
    DynamicFormSchemaField,
    DynamicFormSensitiveAnswers,
    DynamicFormTextField,
};
