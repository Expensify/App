import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import searchCountryOptions from '@libs/searchCountryOptions';
import type {CountryData} from '@libs/searchCountryOptions';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type CountrySelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Function to call when the user closes the business type selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;

    /** Country selected  */
    currentCountry: string;

    /** Function to call when the user selects a country */
    onCountrySelected: (value: CountryData) => void;

    /** Function to call when the user presses on the modal backdrop */
    onBackdropPress?: () => void;
};

function CountrySelectorModal({isVisible, currentCountry, onCountrySelected, onClose, label, onBackdropPress}: CountrySelectorModalProps) {
    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const countries = useMemo(
        () =>
            Object.keys(CONST.ALL_COUNTRIES).map((countryISO) => {
                const countryName = translate(`allCountries.${countryISO}` as TranslationPaths);
                return {
                    value: countryISO,
                    keyForList: countryISO,
                    text: countryName,
                    isSelected: currentCountry === countryISO,
                    searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
                };
            }),
        [translate, currentCountry],
    );

    const searchResults = searchCountryOptions(debouncedSearchValue, countries);
    const headerMessage = debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    const styles = useThemeStyles();

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
            onBackdropPress={onBackdropPress}
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={CountrySelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    headerMessage={headerMessage}
                    sections={[{data: searchResults}]}
                    textInputValue={searchValue}
                    textInputLabel={translate('common.search')}
                    onChangeText={setSearchValue}
                    onSelectRow={onCountrySelected}
                    ListItem={RadioListItem}
                    initiallyFocusedOptionKey={currentCountry}
                    shouldSingleExecuteRowSelect
                    shouldStopPropagation
                    shouldUseDynamicMaxToRenderPerBatch
                />
            </ScreenWrapper>
        </Modal>
    );
}

CountrySelectorModal.displayName = 'CountrySelectorModal';

export default CountrySelectorModal;
