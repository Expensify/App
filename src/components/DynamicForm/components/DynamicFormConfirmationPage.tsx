import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';
import getConfirmationItems from '@components/DynamicForm/utils/getConfirmationItems';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React from 'react';

/** The last page of a dynamic form flow: every answer as a row the user can tap to edit, and a Confirm button */
function DynamicFormConfirmationPage({isEditing, onNext, onMove, groups, values, confirmationTitle, isSubmitting, submitError}: DynamicFormSubPageProps) {
    const {translate} = useLocalize();

    return (
        <ConfirmationStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            pageTitle={confirmationTitle}
            summaryItems={getConfirmationItems(groups, values, translate, onMove)}
            showOnfidoLinks={false}
            isLoading={isSubmitting}
            error={submitError}
            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
        />
    );
}

export default DynamicFormConfirmationPage;
