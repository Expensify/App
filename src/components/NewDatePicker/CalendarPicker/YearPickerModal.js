import React, {useEffect, useMemo, useState} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import HeaderWithBackButton from '../../HeaderWithBackButton';
import CONST from '../../../CONST';
import SelectionList from '../../SelectionList';
import Modal from '../../Modal';
import {radioListItemPropTypes} from '../../SelectionList/selectionListPropTypes';
import useLocalize from '../../../hooks/useLocalize';
import ScreenWrapper from '../../ScreenWrapper';
import styles from '../../../styles/styles';

const propTypes = {
    /** Whether the modal is visible */
    isVisible: PropTypes.bool.isRequired,

    /** The list of years to render */
    years: PropTypes.arrayOf(PropTypes.shape(radioListItemPropTypes.item)).isRequired,

    /** Currently selected year */
    currentYear: PropTypes.number,

    /** Function to call when the user selects a year */
    onYearChange: PropTypes.func,

    /** Function to call when the user closes the year picker */
    onClose: PropTypes.func,
};

const defaultProps = {
    currentYear: new Date().getFullYear(),
    onYearChange: () => {},
    onClose: () => {},
};

function YearPickerModal(props) {
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');
    const {sections, headerMessage} = useMemo(() => {
        const yearsList = searchText === '' ? props.years : _.filter(props.years, (year) => year.text.includes(searchText));
        return {
            headerMessage: !yearsList.length ? translate('common.noResultsFound') : '',
            sections: [{data: yearsList, indexOffset: 0}],
        };
    }, [props.years, searchText, translate]);

    useEffect(() => {
        if (props.isVisible) {
            return;
        }
        setSearchText('');
    }, [props.isVisible]);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={props.isVisible}
            onClose={props.onClose}
            onModalHide={props.onClose}
            hideModalContentWhileAnimating
            useNativeDriver
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
            >
                <HeaderWithBackButton
                    title={translate('yearPickerPage.year')}
                    onBackButtonPress={props.onClose}
                />
                <SelectionList
                    shouldDelayFocus
                    textInputLabel={translate('yearPickerPage.selectYear')}
                    textInputValue={searchText}
                    textInputMaxLength={4}
                    onChangeText={(text) => setSearchText(text.replace(CONST.REGEX.NON_NUMERIC, '').trim())}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                    headerMessage={headerMessage}
                    sections={sections}
                    onSelectRow={(option) => props.onYearChange(option.value)}
                    initiallyFocusedOptionKey={props.currentYear.toString()}
                />
            </ScreenWrapper>
        </Modal>
    );
}

YearPickerModal.propTypes = propTypes;
YearPickerModal.defaultProps = defaultProps;
YearPickerModal.displayName = 'YearPickerModal';

export default YearPickerModal;
