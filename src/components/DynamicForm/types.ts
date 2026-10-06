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

/** `auto` shows a step indicator at three or more pages, `stepper` always, `pages` never */
type DynamicFormLayout = 'auto' | 'pages' | 'stepper';

type DynamicFormFlowProps = Pick<DynamicFormFieldsProps, 'currency' | 'onRefreshRequirements'> & {
    /** The server's schema. Fields of a type this App version does not know are left out. */
    fields: DynamicFormSchemaField[];

    /** The form whose draft holds the answers. Sensitive answers stay in memory instead. */
    formID: OnyxFormKey;

    /** Title in the header of every page */
    headerTitle: string;

    /** Title of the confirmation page */
    confirmationTitle: string;

    /** testID of the screen wrapper */
    testID: string;

    /** Route of a page. The flow passes `edit` when the user opens a page from the confirmation page. */
    buildRoute: UseSubPageProps<SubPageProps>['buildRoute'];

    /** Replaces the route on each page change instead of pushing a new one, for flows on dynamic routes */
    shouldReplaceRoute?: UseSubPageProps<SubPageProps>['shouldReplaceRoute'];

    /** Receives the answers to every visible field, sensitive ones included. The flow drops sensitive answers once `isSubmitting` turns false without `submitError`, or right away when `isSubmitting` is not passed. */
    onSubmit: (answers: DynamicFormValues) => void;

    /** Receives a page and the values its form submitted when the user leaves it with Next, for flows that save each page */
    onPageSubmit?: (page: DynamicFormGroup, values: DynamicFormValues) => void;

    /** Leaves the flow from its first page */
    onBack: () => void;

    /** Shows the confirmation page's Confirm button loading while the screen sends the answers */
    isSubmitting?: boolean;

    /** Error from sending the answers, shown on the confirmation page */
    submitError?: string;

    /** When the step indicator shows: `auto` from three shown pages on, `stepper` always, `pages` never */
    layout?: DynamicFormLayout;

    /** Whether a confirmation page follows the last page. By default only forms with more than five pages get one, and the last page of the others submits. */
    hasConfirmation?: boolean;
};

/** Props of every page in the flow: useSubPage's routing props plus the form's data */
type DynamicFormSubPageProps = SubPageProps &
    Pick<DynamicFormFlowProps, 'formID' | 'currency' | 'onRefreshRequirements' | 'confirmationTitle' | 'isSubmitting' | 'submitError'> & {
        /** The form's fields of supported types */
        fields: DynamicFormField[];

        groups: DynamicFormGroup[];

        /** Draft answers merged with the sensitive answers kept in memory */
        values: DynamicFormValues;

        onGroupSubmit: NonNullable<DynamicFormFlowProps['onPageSubmit']>;

        onOpenListItemEditor: NonNullable<DynamicFormFieldsProps['onOpenListItemEditor']>;

        /** The last page submits the form, since no confirmation page follows */
        isLastPage: boolean;

        /** Saves a list entry from its editor page. Without `itemID` it adds a new entry. */
        onListItemSave: (listKey: string, itemID: string | undefined, answers: DynamicFormValues) => void;
    };

export type {DynamicFormFieldOfType, DynamicFormFlowProps, DynamicFormLayout, DynamicFormSubPageProps, DynamicFormValues};
