import type {FormValue} from '@components/Form/types';

import type {OnyxFormKey} from '@src/ONYXKEYS';
import type {DynamicFormField, DynamicFormFieldType} from '@src/types/onyx';

import type {DynamicFormGroup} from './utils/groupFieldsIntoPages';

/** Current answers keyed by draft key. Address parts sit under `<fieldKey>.<part>`. */
type DynamicFormValues = Partial<Record<string, FormValue>>;

/** The variant of one type. An intersection rather than Extract, since one variant can cover several types, such as select and radio. */
type DynamicFormFieldOfType<TType extends DynamicFormFieldType> = DynamicFormField & {type: TType};

/** What the flow hands every sub page, on top of SubPageProps */
type DynamicFormSubPageProps = {
    formID: OnyxFormKey;
    fields: DynamicFormField[];
    groups: DynamicFormGroup[];

    /** Draft answers merged with the sensitive answers kept in memory */
    values: DynamicFormValues;

    currency?: string;
    onRefreshRequirements?: (inputID: string, value: FormValue) => void;

    /** Receives a page's answers when the user leaves it with Next */
    onGroupSubmit: (group: DynamicFormGroup, answers: DynamicFormValues) => void;

    confirmationTitle: string;
    isSubmitting?: boolean;
    submitError?: string;
};

export type {DynamicFormFieldOfType, DynamicFormSubPageProps, DynamicFormValues};
