import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';
import getConfirmationItems from '@components/DynamicForm/utils/getConfirmationItems';
import getServerPageErrors from '@components/DynamicForm/utils/getServerPageErrors';
import getShownPageErrors from '@components/DynamicForm/utils/getShownPageErrors';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';

/** The last page of a dynamic form flow: every answer as a row the user can tap to edit, the flow's own content such as a terms checkbox, and a Confirm button */
function DynamicFormConfirmationPage({
    isEditing,
    formID,
    onNext,
    onMove,
    pages,
    allFields,
    values,
    confirmationTitle,
    confirmationSubtitle,
    isSubmitting,
    isSavingPages,
    isRefreshingRequirements,
    submitError,
    onOpenListItemEditor,
    shouldShowFieldErrors = false,
    children,
}: DynamicFormSubPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [formState] = useOnyx(formID);
    // The server can reject one answer, such as a SWIFT code for a country it does not pay to, so its row shows why and the alert opens its page
    const serverPageErrors = getServerPageErrors(pages, values, allFields, formState?.errorFields);
    const shownPageErrors = shouldShowFieldErrors ? getShownPageErrors(pages, values, translate, allFields) : [];
    const pageErrors = serverPageErrors.map((serverErrors, index) => ({...serverErrors, ...shownPageErrors.at(index)}));
    const hasServerFieldError = serverPageErrors.some((errors) => !isEmptyObject(errors));
    const firstPageWithErrorsIndex = pageErrors.findIndex((errors) => !isEmptyObject(errors));
    const fieldErrors = Object.fromEntries(pageErrors.flatMap((errors) => Object.entries(errors)));

    return (
        <ConfirmationStep
            isEditing={isEditing}
            // The flow submits whatever onNext carries, and the press event is not answers
            onNext={() => onNext()}
            onMove={onMove}
            pageTitle={confirmationTitle}
            pageSubtitle={confirmationSubtitle}
            groups={getConfirmationItems(pages, allFields, values, translate, onMove, onOpenListItemEditor, isOffline, fieldErrors)}
            showOnfidoLinks={false}
            isLoading={!!isSubmitting || !!isSavingPages || !!isRefreshingRequirements}
            // The generic failure only repeats what the marked row and the alert say
            error={hasServerFieldError ? undefined : submitError}
            isFixErrorsAlertVisible={firstPageWithErrorsIndex !== -1}
            onFixTheErrorsLinkPressed={() => onMove(firstPageWithErrorsIndex)}
            shouldMarkTitleAsHeading
            shouldAnnounceSubmitState
            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
        >
            {children}
        </ConfirmationStep>
    );
}

export default DynamicFormConfirmationPage;
