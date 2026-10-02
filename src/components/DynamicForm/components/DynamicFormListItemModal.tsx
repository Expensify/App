import type {DynamicFormValues} from '@components/DynamicForm/types';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';
import toDynamicFormValues from '@components/DynamicForm/utils/toDynamicFormValues';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormField} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ReactNode} from 'react';

import React from 'react';

type DynamicFormListItemModalProps = {
    isVisible: boolean;
    title: string;
    itemFields: DynamicFormField[];

    /** Answers the form cannot show, such as stored sensitive ones, used when the user leaves them blank */
    keptAnswers: DynamicFormValues;

    renderFields: (fields: DynamicFormField[], values: DynamicFormValues) => ReactNode;
    onSave: (answers: DynamicFormValues) => void;
    onClose: () => void;
};

/** The editor of one list entry outside DynamicFormFlow, as a modal over the page holding the list */
function DynamicFormListItemModal({isVisible, title, itemFields, keptAnswers, renderFields, onSave, onClose}: DynamicFormListItemModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [, itemDraftMetadata] = useOnyx(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT);
    const withKeptAnswers = (inputValues: unknown): DynamicFormValues => {
        const answers = toDynamicFormValues(inputValues);
        const keptBlankAnswers = Object.entries(keptAnswers).filter(([key]) => (answers[key] ?? '') === '');
        return {...answers, ...Object.fromEntries(keptBlankAnswers)};
    };

    return (
        <Modal
            onClose={onClose}
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            shouldUseCustomBackdrop
            shouldHandleNavigationBack
        >
            <ScreenWrapper
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID="DynamicFormListItemModal"
            >
                <HeaderWithBackButtonAndTitle
                    title={title}
                    onBackButtonPress={onClose}
                />
                {isVisible && !isLoadingOnyxValue(itemDraftMetadata) && (
                    <FormProvider
                        formID={ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM}
                        submitButtonText={translate('common.save')}
                        validate={(inputValues) => getDynamicFieldErrors(itemFields, withKeptAnswers(inputValues), translate)}
                        onSubmit={(inputValues) => onSave(withKeptAnswers(inputValues))}
                        style={[styles.mh5, styles.flexGrow1]}
                        submitButtonStyles={styles.mb0}
                        enabledWhenOffline
                    >
                        {({inputValues}) => renderFields(itemFields, toDynamicFormValues(inputValues))}
                    </FormProvider>
                )}
            </ScreenWrapper>
        </Modal>
    );
}

export default DynamicFormListItemModal;
