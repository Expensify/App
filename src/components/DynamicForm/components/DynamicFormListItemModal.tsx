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

import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormField} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ReactNode} from 'react';

import React from 'react';

type DynamicFormListItemModalProps = ForwardedFSClassProps & {
    /** Whether the modal is open */
    isVisible: boolean;

    /** Header title: the entry's name, or the add title for a new entry */
    title: string;

    /** The fields of one entry */
    itemFields: DynamicFormField[];

    /** Stored answers that are not drafted, such as sensitive ones, which the inputs start from */
    keptAnswers: DynamicFormValues;

    /** Every answer of the entry is sensitive, as in a list marked `sensitive`: none is drafted */
    isSensitive: boolean;

    /** Draws the entry's fields inside the modal's form */
    renderFields: (fields: DynamicFormField[], values: DynamicFormValues, isSensitive: boolean) => ReactNode;

    /** Called with the entry's answers when the user saves */
    onSave: (answers: DynamicFormValues) => void;

    /** Called when the user closes the modal without saving */
    onClose: () => void;
};

/** The editor of one list entry outside DynamicFormFlow, as a modal over the page holding the list */
function DynamicFormListItemModal({isVisible, title, itemFields, keptAnswers, isSensitive, renderFields, onSave, onClose, forwardedFSClass}: DynamicFormListItemModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [, itemDraftMetadata] = useOnyx(ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM_DRAFT);
    // Kept answers fill the inputs, so clearing one in the form clears it on save, as on the flow's editor page
    const withInputValues = (inputValues: unknown): DynamicFormValues => ({...keptAnswers, ...toDynamicFormValues(inputValues)});

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
                forwardedFSClass={forwardedFSClass}
            >
                <HeaderWithBackButtonAndTitle
                    title={title}
                    onBackButtonPress={onClose}
                />
                {isVisible && !isLoadingOnyxValue(itemDraftMetadata) && (
                    <FormProvider
                        formID={ONYXKEYS.FORMS.DYNAMIC_FORM_LIST_ITEM_FORM}
                        submitButtonText={translate('common.save')}
                        validate={(inputValues) => getDynamicFieldErrors(itemFields, withInputValues(inputValues), translate)}
                        onSubmit={(inputValues) => onSave(withInputValues(inputValues))}
                        style={[styles.mh5, styles.flexGrow1]}
                        submitButtonStyles={styles.mb0}
                        enabledWhenOffline
                    >
                        {({inputValues}) => renderFields(itemFields, withInputValues(inputValues), isSensitive)}
                    </FormProvider>
                )}
            </ScreenWrapper>
        </Modal>
    );
}

export default DynamicFormListItemModal;
