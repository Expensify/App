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
    onCountrySelected: (value: Option) => void;

    /** Function to call when the user presses on the modal backdrop */
    onBackdropPress?: () => void;
};

function CountrySelectorModal({isVisible, currentCountry, onCountrySelected, onClose, label, onBackdropPress}: CountrySelectorModalProps) {
    const {translate} = useLocalize();
    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const initialCountry = currentCountry;

    const orderedCountryISOs = useMemo(() => {
        const countryKeys = Object.keys(CONST.ALL_COUNTRIES);
        if (!initialCountry || countryKeys.length <= CONST.MOVE_SELECTED_ITEMS_TO_TOP_OF_LIST_THRESHOLD) {
            return countryKeys;
        }
        const selected: string[] = [];
        const remaining: string[] = [];
        for (const countryISO of countryKeys) {
            if (countryISO === initialCountry) {
                selected.push(countryISO);
            } else {
                remaining.push(countryISO);
            }
        }
        return [...selected, ...remaining];
    }, [initialCountry]);

    const countries = useMemo(
        () =>
            orderedCountryISOs.map((countryISO) => {
                const countryName = translate(`allCountries.${countryISO}` as TranslationPaths);
                return {
                    value: countryISO,
                    keyForList: countryISO,
                    text: countryName,
                    isSelected: currentCountry === countryISO,
                    searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
                };
            }),
        [translate, currentCountry, orderedCountryISOs],
    );

    const searchResults = useMemo(() => searchOptions(debouncedSearchValue, countries), [countries, debouncedSearchValue]);
    const headerMessage = debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    const styles = useThemeStyles();

    const textInputOptions = useMemo(
        () => ({
            value: searchValue,
            label: translate('common.search'),
            onChangeText: setSearchValue,
            headerMessage,
        }),
        [headerMessage, searchValue, translate, setSearchValue],
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
                testID="CountrySelectorModal"
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    data={searchResults}
                    textInputOptions={textInputOptions}
                    onSelectRow={onCountrySelected}
                    ListItem={RadioListItem}
                    initiallyFocusedItemKey={currentCountry}
                    shouldSingleExecuteRowSelect
                    shouldStopPropagation
                />
            </ScreenWrapper>
        </Modal>
    );
}

export default CountrySelectorModal;
