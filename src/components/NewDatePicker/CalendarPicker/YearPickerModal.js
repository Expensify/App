import React from 'react';
import PropTypes from 'prop-types';
import {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../withCurrentUserPersonalDetails';
import HeaderWithBackButton from '../../HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../withLocalize';
import CONST from '../../../CONST';
import SelectionListRadio from '../../SelectionListRadio';
import Modal from '../../Modal';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,

    /** Function to call when the user selects a year */
    onYearChange: PropTypes.func.isRequired,

    /** Function to call when the user closes the year picker */
    onClose: PropTypes.func.isRequired,

    /** Currently selected year */
    currentYear: PropTypes.number.isRequired,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
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
