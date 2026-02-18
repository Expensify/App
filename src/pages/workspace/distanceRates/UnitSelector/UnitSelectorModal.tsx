import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import type {UnitItemType} from '@components/UnitPicker';
import UnitPicker from '@components/UnitPicker';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Unit} from '@src/types/onyx/Policy';

type UnitSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Selected unit  */
    currentUnit?: Unit;

    /** Function to call when the user selects a unit */
    onUnitSelected: (value: UnitItemType) => void;

    /** Function to call when the user closes the unit selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;
};

function UnitSelectorModal({isVisible, currentUnit, onUnitSelected, onClose, label}: UnitSelectorModalProps) {
    const styles = useThemeStyles();

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="UnitSelectorModal"
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <UnitPicker
                    defaultValue={currentUnit}
                    onOptionSelected={onUnitSelected}
                />
            </ScreenWrapper>
        </Modal>
    );
}

export default UnitSelectorModal;
