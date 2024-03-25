import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import React, {useEffect, useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import searchCountryOptions from '@libs/searchCountryOptions';
import type {CountryData} from '@libs/searchCountryOptions';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';

type State = keyof typeof COMMON_CONST.STATES;

type StateSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** State value selected  */
    currentState?: State;

    /** Function to call when the user selects a State */
    onStateSelected?: (state: CountryData) => void;

    /** Function to call when the user closes the State modal */
    onClose?: () => void;

    /** The search value from the selection list */
    searchValue: string;

    /** Function to call when the user types in the search input */
    setSearchValue: (value: string) => void;

    /** Label to display on field */
    label?: string;
};

function StateSelectorModal({currentState, isVisible, onClose = () => {}, onStateSelected = () => {}, searchValue, setSearchValue, label}: StateSelectorModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        if (isVisible) {
            return;
        }
        setSearchValue('');
    }, [isVisible, setSearchValue]);

    const countryStates: CountryData[] = useMemo(
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

    const searchResults = searchCountryOptions(searchValue, countryStates);
    const headerMessage = searchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

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
                testID={StateSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    // Label can be an empty string
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    title={label || translate('common.state')}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    headerMessage={headerMessage}
                    // Label can be an empty string
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    textInputLabel={label || translate('common.state')}
                    textInputValue={searchValue}
                    sections={[{data: searchResults, indexOffset: 0}]}
                    onSelectRow={onStateSelected}
                    onChangeText={setSearchValue}
                    initiallyFocusedOptionKey={currentState}
                    shouldStopPropagation
                    shouldUseDynamicMaxToRenderPerBatch
                    ListItem={RadioListItem}
                />
            </ScreenWrapper>
        </Modal>
    );
}

StateSelectorModal.displayName = 'StateSelectorModal';

export default StateSelectorModal;
export type {State};
