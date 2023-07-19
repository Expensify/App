import _ from 'underscore';
import lodashGet from 'lodash/get';
import React, {useState, useMemo} from 'react';
import PropTypes from 'prop-types';
import CONST from '../../CONST';
import Modal from '../Modal';
import HeaderWithBackButton from '../HeaderWithBackButton';
import SelectionListRadio from '../SelectionListRadio';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** Whether the modal is visible */
    isVisible: PropTypes.bool.isRequired,

    /** State value selected  */
    currentState: PropTypes.string,

    /** Function to call when the user selects a State */
    onStateSelected: PropTypes.func,

    /** Function to call when the user closes the State modal */
    onClose: PropTypes.func,
};

const defaultProps = {
    currentState: '',
    onClose: () => {},
    onStateSelected: () => {},
};

function filterOptions(searchValue, data) {
    const trimmedSearchValue = searchValue.trim();
    if (trimmedSearchValue.length === 0) {
        return [];
    }

    return _.filter(data, (country) => country.text.toLowerCase().includes(searchValue.toLowerCase()));
}

function StateSelectorModal({currentState, isVisible, onClose, onStateSelected}) {
    const {translate} = useLocalize();
    const allStates = translate('allStates');
    const [searchValue, setSearchValue] = useState(lodashGet(allStates, `${currentState}.stateName`, ''));

    const countryStates = useMemo(
        () =>
            _.map(translate('allStates'), (state) => ({
                value: state.stateISO,
                keyForList: state.stateISO,
                text: state.stateName,
                isSelected: currentState === state.stateISO,
            })),
        [translate, currentState],
    );

    const filteredData = filterOptions(searchValue, countryStates);
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
                title={translate('common.state')}
                shouldShowBackButton
                onBackButtonPress={onClose}
            />
            <SelectionListRadio
                headerMessage={headerMessage}
                textInputLabel={translate('common.state')}
                textInputPlaceholder={translate('pronounsPage.placeholderText')}
                textInputValue={searchValue}
                sections={[{data: filteredData, indexOffset: 0}]}
                onSelectRow={onStateSelected}
                onChangeText={setSearchValue}
                shouldFocusOnSelectRow
                shouldHaveOptionSeparator
                shouldDelayFocus
                initiallyFocusedOptionKey={currentState}
            />
        </Modal>
    );
}

StateSelectorModal.propTypes = propTypes;
StateSelectorModal.defaultProps = defaultProps;
StateSelectorModal.displayName = 'StateSelectorModal';

export default StateSelectorModal;
