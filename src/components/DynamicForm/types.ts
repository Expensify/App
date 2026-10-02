import type {FormValue} from '@components/Form/types';

import type {SubPageProps, UseSubPageProps} from '@hooks/useSubPage/types';

import type {OnyxFormKey} from '@src/ONYXKEYS';
import type {DynamicFormField, DynamicFormFieldType, DynamicFormSchemaField} from '@src/types/onyx';

import type {DynamicFormFieldsProps} from './components/DynamicFormFields';
import type {DynamicFormGroup} from './utils/groupFieldsIntoPages';

/** Current answers keyed by draft key. Address parts sit under `<fieldKey>.<part>`. */
type DynamicFormValues = Partial<Record<string, FormValue>>;

/** The variant of one type. An intersection rather than Extract, since one variant can cover several types, such as select and radio. */
type DynamicFormFieldOfType<TType extends DynamicFormFieldType> = DynamicFormField & {type: TType};

type DynamicFormFlowProps = Pick<DynamicFormFieldsProps, 'currency' | 'onRefreshRequirements'> & {
    fields: DynamicFormSchemaField[];

    /** The form whose draft holds the answers. Sensitive answers stay in memory instead. */
    formID: OnyxFormKey;

    headerTitle: string;
    confirmationTitle: string;
    testID: string;

    /** Route of a page. The flow passes `edit` when the user opens a page from the confirmation page. */
    buildRoute: UseSubPageProps<SubPageProps>['buildRoute'];

    shouldReplaceRoute?: UseSubPageProps<SubPageProps>['shouldReplaceRoute'];

    /** Receives the answers to every visible field, sensitive ones included. Call clearSensitiveAnswers once the submission succeeds. */
    onSubmit: (answers: DynamicFormValues) => void;

    /** Receives a page's visible answers when the user leaves it with Next, for flows that save each page */
    onGroupSubmit?: (group: DynamicFormGroup, answers: DynamicFormValues) => void;

    /** Leaves the flow from its first page */
    onBack: () => void;

    isSubmitting?: boolean;
    submitError?: string;
};

/** Props of every page in the flow: useSubPage's routing props plus the form's data */
type DynamicFormSubPageProps = SubPageProps &
    Pick<DynamicFormFlowProps, 'formID' | 'currency' | 'onRefreshRequirements' | 'confirmationTitle' | 'isSubmitting' | 'submitError'> & {
        /** The form's fields of supported types */
        fields: DynamicFormField[];

        groups: DynamicFormGroup[];

        /** Draft answers merged with the sensitive answers kept in memory */
        values: DynamicFormValues;

        onGroupSubmit: NonNullable<DynamicFormFlowProps['onGroupSubmit']>;
    };

export type {DynamicFormFieldOfType, DynamicFormFlowProps, DynamicFormSubPageProps, DynamicFormValues};
