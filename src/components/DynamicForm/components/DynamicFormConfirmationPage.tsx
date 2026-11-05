import CheckboxWithLabel from '@components/CheckboxWithLabel';
import type {DynamicFormSubPageProps} from '@components/DynamicForm/types';
import getConfirmationItems from '@components/DynamicForm/utils/getConfirmationItems';
import ConfirmationStep from '@components/SubStepForms/ConfirmationStep';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useState} from 'react';

/** The last page of a dynamic form flow: every answer as a row the user can tap to edit, and a Confirm button */
function DynamicFormConfirmationPage({
    isEditing,
    onNext,
    onMove,
    pages,
    allFields,
    values,
    confirmationTitle,
    confirmationSubtitle,
    confirmationTerms,
    isSubmitting,
    isSavingPages,
    isRefreshingRequirements,
    submitError,
    onOpenListItemEditor,
}: DynamicFormSubPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);
    const [termsError, setTermsError] = useState('');

    const acceptTerms = (isChecked?: boolean) => {
        setIsTermsAccepted(!!isChecked);
        setTermsError('');
    };

    /** The flow submits whatever onNext carries, and the press event is not answers */
    const confirm = () => {
        if (confirmationTerms && !isTermsAccepted) {
            setTermsError(confirmationTerms.errorText);
            return;
        }
        onNext();
    };

    return (
        <ConfirmationStep
            isEditing={isEditing}
            onNext={confirm}
            onMove={onMove}
            pageTitle={confirmationTitle}
            pageSubtitle={confirmationSubtitle}
            groups={getConfirmationItems(pages, allFields, values, translate, onMove, onOpenListItemEditor)}
            showOnfidoLinks={false}
            isLoading={!!isSubmitting || !!isSavingPages || !!isRefreshingRequirements}
            error={submitError}
            shouldMarkTitleAsHeading
            shouldAnnounceSubmitState
            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
        >
            {!!confirmationTerms && (
                <CheckboxWithLabel
                    LabelComponent={confirmationTerms.LabelComponent}
                    accessibilityLabel={confirmationTerms.accessibilityLabel}
                    isChecked={isTermsAccepted}
                    onInputChange={acceptTerms}
                    errorText={termsError}
                    style={styles.mb3}
                />
            )}
        </ConfirmationStep>
    );
}

export default DynamicFormConfirmationPage;
