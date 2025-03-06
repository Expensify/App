import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {BusinessTypeItemType, IncorporationType} from './types';

type BusinessTypeSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Business type value selected  */
    currentBusinessType: string;

    /** Function to call when the user selects a business type */
    onBusinessTypeSelected: (value: BusinessTypeItemType) => void;

    /** Function to call when the user closes the business type selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;
};

function BusinessTypeSelectorModal({isVisible, currentBusinessType, onBusinessTypeSelected, onClose, label}: BusinessTypeSelectorModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const incorporationTypes = useMemo(
        () =>
            Object.keys(CONST.INCORPORATION_TYPES).map((key) => ({
                value: key,
                text: translate(`businessInfoStep.incorporationType.${key as IncorporationType}`),
                keyForList: key,
                isSelected: key === currentBusinessType,
            })),
        [currentBusinessType, translate],
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={BusinessTypeSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    sections={[{data: incorporationTypes}]}
                    initiallyFocusedOptionKey={currentBusinessType}
                    onSelectRow={onBusinessTypeSelected}
                    shouldSingleExecuteRowSelect
                    shouldStopPropagation
                    shouldUseDynamicMaxToRenderPerBatch
                    ListItem={RadioListItem}
                />
            </ScreenWrapper>
        </Modal>
    );
}

BusinessTypeSelectorModal.displayName = 'BusinessTypeSelectorModal';

export default BusinessTypeSelectorModal;
