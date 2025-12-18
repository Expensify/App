import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import searchOptions from '@libs/searchOptions';
import type {Option} from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';

type State = keyof typeof COMMON_CONST.STATES;

type StateSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Function to call when the user closes the business type selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;

    /** State selected  */
    currentState: string;

    /** Function to call when the user selects a state */
    onStateSelected: (value: Option) => void;

    /** Function to call when the user presses on the modal backdrop */
    onBackdropPress?: () => void;
};

function StateSelectorModal({isVisible, currentState, onStateSelected, onClose, label, onBackdropPress}: StateSelectorModalProps) {
    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const styles = useThemeStyles();

    const countryStates = useMemo(
        () =>
            Object.keys(COMMON_CONST.STATES).map((state) => {
                const stateName = translate(`allStates.${state as State}.stateName`);
                const stateISO = translate(`allStates.${state as State}.stateISO`);
                return {
                    value: stateISO,
                    keyForList: stateISO,
                    text: stateName,
                    isSelected: currentState === stateISO,
                    searchValue: StringUtils.sanitizeString(`${stateISO}${stateName}`),
                };
            }),

        [translate, currentState],
    );

    const searchResults = searchOptions(debouncedSearchValue, countryStates);

    const textInputOptions = useMemo(
        () => ({
            headerMessage: debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '',
            value: searchValue,
            label: translate('common.search'),
            onChangeText: setSearchValue,
        }),
        [debouncedSearchValue, searchResults.length, searchValue, setSearchValue, translate],
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            onBackdropPress={onBackdropPress}
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID="StateSelectorModal"
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    data={searchResults}
                    ListItem={RadioListItem}
                    onSelectRow={onStateSelected}
                    textInputOptions={textInputOptions}
                    initiallyFocusedItemKey={currentState}
                    disableMaintainingScrollPosition
                    shouldSingleExecuteRowSelect
                    shouldStopPropagation
                />
            </ScreenWrapper>
        </Modal>
    );
}

export default StateSelectorModal;
