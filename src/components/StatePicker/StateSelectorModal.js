import {CONST as COMMON_CONST} from 'expensify-common/lib/CONST';
import PropTypes from 'prop-types';
import React, {useEffect, useMemo} from 'react';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import searchCountryOptions from '@libs/searchCountryOptions';
import StringUtils from '@libs/StringUtils';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    /** Whether the modal is visible */
    isVisible: PropTypes.bool.isRequired,

    /** State value selected  */
    currentState: PropTypes.string,

    /** Function to call when the user selects a State */
    onStateSelected: PropTypes.func,

    /** Function to call when the user closes the State modal */
    onClose: PropTypes.func,

    /** The search value from the selection list */
    searchValue: PropTypes.string.isRequired,

    /** Function to call when the user types in the search input */
    setSearchValue: PropTypes.func.isRequired,

    /** Label to display on field */
    label: PropTypes.string,
};

const defaultProps = {
    currentState: '',
    onClose: () => {},
    onStateSelected: () => {},
    label: undefined,
};

function StateSelectorModal({currentState, isVisible, onClose, onStateSelected, searchValue, setSearchValue, label}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        if (isVisible) {
            return;
        }
        setSearchValue('');
    }, [isVisible, setSearchValue]);

    const countryStates = useMemo(
        () =>
            _.map(_.keys(COMMON_CONST.STATES), (state) => {
                const stateName = translate(`allStates.${state}.stateName`);
                const stateISO = translate(`allStates.${state}.stateISO`);
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
                    title={label || translate('common.state')}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    headerMessage={headerMessage}
                    textInputLabel={label || translate('common.state')}
                    textInputValue={searchValue}
                    sections={[{data: searchResults, indexOffset: 0}]}
                    onSelectRow={onStateSelected}
                    onChangeText={setSearchValue}
                    initiallyFocusedOptionKey={currentState}
                    shouldStopPropagation
                    shouldUseDynamicMaxToRenderPerBatch
                />
            </ScreenWrapper>
        </Modal>
    );
}

StateSelectorModal.propTypes = propTypes;
StateSelectorModal.defaultProps = defaultProps;
StateSelectorModal.displayName = 'StateSelectorModal';

export default StateSelectorModal;
