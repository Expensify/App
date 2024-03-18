import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {Unit} from '@src/types/onyx/Policy';
import type {UnitItemType, UnitType} from './types';

type UnitSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Selected unit  */
    currentUnit: string;

    /** Function to call when the user selects a unit */
    onUnitSelected: (value: UnitItemType) => void;

    /** Function to call when the user closes the unit selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;
};

function UnitSelectorModal({isVisible, currentUnit, onUnitSelected, onClose, label}: UnitSelectorModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const units = useMemo(
        () =>
            Object.keys(CONST.POLICY.UNITS).map((key) => ({
                value: key.toLowerCase() as Unit,
                text: translate(`workspace.distanceRates.units.${key as UnitType}`),
                keyForList: key,
                isSelected: key === currentUnit,
            })),
        [currentUnit, translate],
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
                testID={UnitSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    ListItem={RadioListItem}
                    sections={[{data: units, indexOffset: 0}]}
                    initiallyFocusedOptionKey={currentUnit}
                    onSelectRow={onUnitSelected}
                    shouldStopPropagation
                />
            </ScreenWrapper>
        </Modal>
    );
}

UnitSelectorModal.displayName = 'UnitSelectorModal';

export default UnitSelectorModal;
