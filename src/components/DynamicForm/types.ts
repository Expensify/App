import type {FormValue} from '@components/Form/types';

import type {SubPageProps, UseSubPageProps} from '@hooks/useSubPage/types';

import type {OnyxFormKey} from '@src/ONYXKEYS';
import type {DynamicFormField, DynamicFormFieldType, DynamicFormPage, DynamicFormSchema} from '@src/types/onyx';

import type {DynamicFormFieldsProps} from './components/DynamicFormFields';

/** Current answers keyed by draft key. Address parts sit under `<fieldKey>.<part>`. */
type DynamicFormValues = Partial<Record<string, FormValue>>;

/** The variant of one type. An intersection rather than Extract, since one variant can cover several types, such as select and radio. */
type DynamicFormFieldOfType<TType extends DynamicFormFieldType> = DynamicFormField & {type: TType};

/** `auto` shows a step indicator at three or more pages, `stepper` always, `pages` never */
type DynamicFormLayout = 'auto' | 'pages' | 'stepper';

type DynamicFormFlowProps = Pick<DynamicFormFieldsProps, 'currency' | 'maxFileSize' | 'onRefreshRequirements'> & {
    /** The pages as the server groups them, or a flat list of fields the App paginates. Fields of a type this App version does not know are left out. */
    schema: DynamicFormSchema;

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

    /** Receives a page and its draft answers when the user leaves it with Next, for flows that save each page. Sensitive answers are not passed, since a page save would persist them in the request queue. */
    onPageSubmit?: (page: DynamicFormPage, answers: DynamicFormValues) => void;

    /** Leaves the flow from its first page */
    onBack: () => void;

    /** Shows the confirmation page's Confirm button loading while the screen sends the answers */
    isSubmitting?: boolean;

    /** Error from sending the answers, shown on the confirmation page */
    submitError?: string;

    /** When the step indicator shows: `auto` from three shown pages on, `stepper` always, `pages` never */
    layout?: DynamicFormLayout;

    /** Whether a confirmation page follows the last page. On by default. A form with no page always gets one, since there has to be a page to land on. */
    hasConfirmation?: boolean;
};

/** Props of every page in the flow: useSubPage's routing props plus the form's data */
type DynamicFormSubPageProps = SubPageProps &
    Pick<DynamicFormFlowProps, 'formID' | 'currency' | 'maxFileSize' | 'onRefreshRequirements' | 'confirmationTitle' | 'isSubmitting' | 'submitError'> & {
        pages: DynamicFormPage[];

        /** Every supported field of the form, which is where a `showWhen` finds its controller */
        allFields: DynamicFormField[];

        /** Draft answers merged with the sensitive answers kept in memory */
        values: DynamicFormValues;

        onPageSubmit: (page: DynamicFormPage, pageValues: DynamicFormValues) => void;

        onOpenListItemEditor: NonNullable<DynamicFormFieldsProps['onOpenListItemEditor']>;

        onListItemsChange: NonNullable<DynamicFormFieldsProps['onListItemsChange']>;

        /** The last page submits the form, since no confirmation page follows */
        isLastPage: boolean;

        /** Saves a list entry from its editor page. Without `itemID` it adds a new entry. */
        onListItemSave: (listKey: string, itemID: string | undefined, answers: DynamicFormValues) => void;
    };

export type {DynamicFormFieldOfType, DynamicFormFlowProps, DynamicFormLayout, DynamicFormSubPageProps, DynamicFormValues};
