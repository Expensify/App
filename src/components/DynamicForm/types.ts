import type {FormValue} from '@components/Form/types';

import type {SubPageProps, UseSubPageProps} from '@hooks/useSubPage/types';

import type {OnyxFormKey} from '@src/ONYXKEYS';
import type {DynamicFormField, DynamicFormFieldType, DynamicFormPage, DynamicFormSchema} from '@src/types/onyx';

import type {ReactNode} from 'react';

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

    /** Text under the confirmation page's title */
    confirmationSubtitle?: string;

    /** Drawn on the confirmation page between the answers and Confirm, such as a terms checkbox. Confirm calls `onSubmit`, where the screen can check it before it sends anything. */
    children?: ReactNode;

    /** testID of the screen wrapper */
    testID: string;

    /** Route of a page. The flow passes `edit` when the user opens a page from the confirmation page. */
    buildRoute: UseSubPageProps<SubPageProps>['buildRoute'];

    /** Replaces the route on each page change instead of pushing a new one, for flows on dynamic routes */
    shouldReplaceRoute?: UseSubPageProps<SubPageProps>['shouldReplaceRoute'];

    /** Receives the answers to every visible field, sensitive ones included. The flow drops sensitive answers once `isSubmitting` turns false without `submitError`, or right away when `isSubmitting` is not passed. */
    onSubmit: (answers: DynamicFormValues) => void;

    /**
     * Receives a page and its draft answers when the user leaves it with Next, for flows that save each page.
     * The page's sensitive answers come apart from the others, so the screen can send them on a request that is not written to disk.
     * Sensitive answers inside list entries, such as a director's SSN, are not passed, since they stay in memory only.
     */
    onPageSubmit?: (page: DynamicFormPage, answers: DynamicFormValues, sensitiveAnswers: DynamicFormValues) => void;

    /** Leaves the flow from its first page */
    onBack: () => void;

    /** Shows the confirmation page's Confirm button loading while the screen sends the answers */
    isSubmitting?: boolean;

    /** Error from sending the answers, shown on the confirmation page */
    submitError?: string;

    /**
     * Shows the confirmation page's Confirm button loading while pages saved with `onPageSubmit` are still saving. Unlike `isSubmitting`, the flow keeps the
     * sensitive answers when it turns false.
     */
    isSavingPages?: boolean;

    /** Shows the Next and Confirm buttons loading while the screen asks for requirements that match a new answer, so the user does not move on with fields that are about to change */
    isRefreshingRequirements?: boolean;

    /** Error from asking for new requirements, shown on every fields page, since the answer that asked for them can be on any page */
    refreshError?: string;

    /** Pages whose `onPageSubmit` save has not gone through, so a new visit starts on the first one shown instead of where the draft leaves off */
    unsavedPageKeys?: string[];

    /** When the step indicator shows: `auto` from three shown pages on, `stepper` always, `pages` never */
    layout?: DynamicFormLayout;

    /** Whether a confirmation page follows the last page. On by default. A form with no page always gets one, since there has to be a page to land on. */
    hasConfirmation?: boolean;

    /**
     * Disables Next offline on every page, for flows that save each page to the server as the user leaves it, and shows the offline indicator on wide
     * screens too, so the user sees why. Off by default, so only the last page waits for a connection.
     */
    shouldDisableNextWhenOffline?: boolean;
};

/** Props of every page in the flow: useSubPage's routing props plus the form's data */
type DynamicFormSubPageProps = SubPageProps &
    Pick<
        DynamicFormFlowProps,
        | 'formID'
        | 'currency'
        | 'maxFileSize'
        | 'onRefreshRequirements'
        | 'confirmationTitle'
        | 'confirmationSubtitle'
        | 'children'
        | 'isSubmitting'
        | 'submitError'
        | 'isSavingPages'
        | 'isRefreshingRequirements'
        | 'refreshError'
        | 'shouldDisableNextWhenOffline'
    > & {
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

        /** Confirm was pressed while a field had no valid answer, so the confirmation page marks the rows to fix */
        shouldShowFieldErrors?: boolean;

        /** Saves a list entry from its editor page. Without `itemID` it adds a new entry. */
        onListItemSave: (listKey: string, itemID: string | undefined, answers: DynamicFormValues) => void;
    };

export type {DynamicFormFieldOfType, DynamicFormFlowProps, DynamicFormLayout, DynamicFormSubPageProps, DynamicFormValues};
