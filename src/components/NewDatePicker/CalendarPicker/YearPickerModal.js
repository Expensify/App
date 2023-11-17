import PropTypes from 'prop-types';
import React, {useEffect, useMemo, useState} from 'react';
import _ from 'underscore';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import {radioListItemPropTypes} from '@components/SelectionList/selectionListPropTypes';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

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
    const styles = useThemeStyles();
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
                testID={YearPickerModal.displayName}
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
                    inputMode={CONST.INPUT_MODE.NUMERIC}
                    headerMessage={headerMessage}
                    sections={sections}
                    onSelectRow={(option) => props.onYearChange(option.value)}
                    initiallyFocusedOptionKey={props.currentYear.toString()}
                    showScrollIndicator
                    shouldStopPropagation
                />
            </ScreenWrapper>
        </Modal>
    );
}

YearPickerModal.propTypes = propTypes;
YearPickerModal.defaultProps = defaultProps;
YearPickerModal.displayName = 'YearPickerModal';

export default YearPickerModal;
