import _ from 'underscore';
import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import HeaderWithBackButton from '../HeaderWithBackButton';
import SelectionList from '../SelectionList';
import Modal from '../Modal';
import ScreenWrapper from '../ScreenWrapper';
import styles from '../../styles/styles';
import searchCountryOptions from '../../libs/searchCountryOptions';
import StringUtils from '../../libs/StringUtils';

const propTypes = {
    /** Whether the modal is visible */
    isVisible: PropTypes.bool.isRequired,

    /** Country value selected  */
    currentCountry: PropTypes.string,

    /** Function to call when the user selects a Country */
    onCountrySelected: PropTypes.func,

    /** Function to call when the user closes the Country modal */
    onClose: PropTypes.func,

    /** The search value from the selection list */
    searchValue: PropTypes.string.isRequired,

    /** Function to call when the user types in the search input */
    setSearchValue: PropTypes.func.isRequired,
};

const defaultProps = {
    currentCountry: '',
    onClose: () => {},
    onCountrySelected: () => {},
};

function CountrySelectorModal({currentCountry, isVisible, onClose, onCountrySelected, setSearchValue, searchValue}) {
    const {translate} = useLocalize();

    const countries = useMemo(
        () =>
            _.map(translate('allCountries'), (countryName, countryISO) => ({
                value: countryISO,
                keyForList: countryISO,
                text: countryName,
                isSelected: currentCountry === countryISO,
                searchValue: StringUtils.sanitizeString(`${countryISO}${countryName}`),
            })),
        [translate, currentCountry],
    );

    const searchResults = searchCountryOptions(searchValue, countries);
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
            >
                <HeaderWithBackButton
                    title={translate('common.country')}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    headerMessage={headerMessage}
                    textInputLabel={translate('common.country')}
                    textInputPlaceholder={translate('countrySelectorModal.placeholderText')}
                    textInputValue={searchValue}
                    sections={[{data: searchResults, indexOffset: 0}]}
                    onSelectRow={onCountrySelected}
                    onChangeText={setSearchValue}
                    shouldDelayFocus
                    initiallyFocusedOptionKey={currentCountry}
                />
            </ScreenWrapper>
        </Modal>
    );
}

CountrySelectorModal.propTypes = propTypes;
CountrySelectorModal.defaultProps = defaultProps;
CountrySelectorModal.displayName = 'CountrySelectorModal';

export default CountrySelectorModal;
