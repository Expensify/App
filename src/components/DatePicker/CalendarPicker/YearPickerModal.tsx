import React, {useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type CalendarPickerListItem from './types';

type YearPickerModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** The list of years to render */
    years: CalendarPickerListItem[];

    /** Currently selected year */
    currentYear?: number;

    /** Function to call when the user selects a year */
    onYearChange?: (year: number) => void;

    /** Function to call when the user closes the year picker */
    onClose?: () => void;
};

function YearPickerModal({isVisible, years, currentYear = new Date().getFullYear(), onYearChange, onClose}: YearPickerModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');
    const {sections, headerMessage} = useMemo(() => {
        const yearsList = searchText === '' ? years : years.filter((year) => year.text?.includes(searchText));
        return {
            headerMessage: !yearsList.length ? translate('common.noResultsFound') : '',
            sections: [{data: yearsList.sort((a, b) => b.value - a.value), indexOffset: 0}],
        };
    }, [years, searchText, translate]);

    useEffect(() => {
        if (isVisible) {
            return;
        }
        setSearchText('');
    }, [isVisible]);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={() => onClose?.()}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
            shouldHandleNavigationBack
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom
                testID={YearPickerModal.displayName}
            >
                <HeaderWithBackButton
                    title={translate('yearPickerPage.year')}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    textInputLabel={translate('yearPickerPage.selectYear')}
                    textInputValue={searchText}
                    textInputMaxLength={4}
                    onChangeText={(text) => setSearchText(text.replace(CONST.REGEX.NON_NUMERIC, '').trim())}
                    inputMode={CONST.INPUT_MODE.NUMERIC}
                    headerMessage={headerMessage}
                    sections={sections}
                    onSelectRow={(option) => {
                        Keyboard.dismiss();
                        onYearChange?.(option.value);
                    }}
                    initiallyFocusedOptionKey={currentYear.toString()}
                    showScrollIndicator
                    shouldStopPropagation
                    shouldUseDynamicMaxToRenderPerBatch
                    ListItem={RadioListItem}
                />
            </ScreenWrapper>
        </Modal>
    );
}

YearPickerModal.displayName = 'YearPickerModal';

export default YearPickerModal;
