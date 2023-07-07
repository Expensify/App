import React from 'react';
import PropTypes from 'prop-types';
import {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../withCurrentUserPersonalDetails';
import HeaderWithBackButton from '../../HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import CONST from '../../../CONST';
import SelectionListRadio from '../../SelectionListRadio';
import Modal from '../../Modal';
import {radioListItemPropTypes} from '../../SelectionListRadio/selectionListRadioPropTypes';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,

    /** Whether the modal is visible */
    isVisible: PropTypes.bool.isRequired,

    /** The list of years to render */
    years: PropTypes.arrayOf(PropTypes.shape(radioListItemPropTypes)).isRequired,

    /** Currently selected year */
    currentYear: PropTypes.number.isRequired,

    /** Function to call when the user selects a year */
    onYearChange: PropTypes.func.isRequired,

    /** Value for the text input */
    textInputValue: PropTypes.string.isRequired,

    /** Callback to fire when the text input changes */
    onChangeText: PropTypes.func.isRequired,

    /** Function to call when the user closes the year picker */
    onClose: PropTypes.func.isRequired,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
    isVisible: false,
    years: [],
    currentYear: new Date().getFullYear(),
    onYearChange: () => {},
    textInputValue: '',
    onChangeText: () => {},
    onClose: () => {},
};

function YearPickerModal(props) {
    const headerMessage = props.textInputValue.trim() && !props.years.length ? props.translate('common.noResultsFound') : '';

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={props.isVisible}
            onClose={props.onClose}
            onModalHide={props.onClose}
            hideModalContentWhileAnimating
            useNativeDriver
        >
            <HeaderWithBackButton
                title={props.translate('yearPickerPage.year')}
                onBackButtonPress={props.onClose}
            />
            <SelectionListRadio
                shouldDelayFocus
                textInputLabel={props.translate('yearPickerPage.selectYear')}
                textInputValue={props.textInputValue}
                textInputMaxLength={4}
                onChangeText={props.onChangeText}
                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                headerMessage={headerMessage}
                sections={[{data: props.years, indexOffset: 0}]}
                onSelectRow={(option) => props.onYearChange(option.value)}
                initiallyFocusedOptionKey={props.currentYear.toString()}
            />
        </Modal>
    );
}

YearPickerModal.propTypes = propTypes;
YearPickerModal.defaultProps = defaultProps;
YearPickerModal.displayName = 'YearPickerModal';

export default withLocalize(YearPickerModal);
