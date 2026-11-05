import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';
import getConfirmationItems from '@components/DynamicForm/utils/getConfirmationItems';
import getShownPageErrors from '@components/DynamicForm/utils/getShownPageErrors';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';

import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React from 'react';

/** The last page of a dynamic form flow: every answer as a row the user can tap to edit, the flow's own content such as a terms checkbox, and a Confirm button */
function DynamicFormConfirmationPage({
    isEditing,
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
    const pageErrors = shouldShowFieldErrors ? getShownPageErrors(pages, values, translate, allFields) : [];
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
            error={submitError}
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
