import _ from 'underscore';
import React, {useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import HeaderWithBackButton from '../HeaderWithBackButton';
import SelectionListRadio from '../SelectionListRadio';
import Modal from '../Modal';

const propTypes = {
    /** Whether the modal is visible */
    isVisible: PropTypes.bool.isRequired,

    /** Country value selected  */
    currentCountry: PropTypes.string,

    /** Function to call when the user selects a Country */
    onCountrySelected: PropTypes.func,

    /** Function to call when the user closes the Country modal */
    onClose: PropTypes.func,
};

const defaultProps = {
    currentCountry: '',
    onClose: () => {},
    onCountrySelected: () => {},
};

function filterOptions(searchValue, data) {
    const trimmedSearchValue = searchValue.trim();
    if (trimmedSearchValue.length === 0) {
        return [];
    }

    return _.filter(data, (country) => country.text.toLowerCase().includes(searchValue.toLowerCase()));
}

function CountrySelectorModal({currentCountry, isVisible, onClose, onCountrySelected}) {
    const {translate} = useLocalize();
    const selectedSearchCountry = PersonalDetails.getCountryName(currentCountry);
    const [searchValue, setSearchValue] = useState(selectedSearchCountry);

    const countries = useMemo(
        () =>
            _.map(translate('allCountries'), (countryName, countryISO) => ({
                value: countryISO,
                keyForList: countryISO,
                text: countryName,
                isSelected: currentCountry === countryISO,
            })),
        [translate, currentCountry],
    );

    const filteredData = filterOptions(searchValue, countries);
    const headerMessage = searchValue.trim() && !filteredData.length ? translate('common.noResultsFound') : '';

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
        >
            <HeaderWithBackButton
                title={translate('common.country')}
                onBackButtonPress={onClose}
            />
            <SelectionListRadio
                headerMessage={headerMessage}
                textInputLabel={translate('common.country')}
                textInputPlaceholder={translate('countrySelectorModal.placeholderText')}
                textInputValue={searchValue}
                sections={[{data: filteredData, indexOffset: 0}]}
                onSelectRow={onCountrySelected}
                onChangeText={setSearchValue}
                shouldFocusOnSelectRow
                shouldHaveOptionSeparator
                shouldDelayFocus
                initiallyFocusedOptionKey={currentCountry}
            />
        </Modal>
    );
}

CountrySelectorModal.propTypes = propTypes;
CountrySelectorModal.defaultProps = defaultProps;
CountrySelectorModal.displayName = 'CountrySelectorModal';

export default CountrySelectorModal;
