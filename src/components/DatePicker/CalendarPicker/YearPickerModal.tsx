import React, {useEffect, useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
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
    const {data, headerMessage} = useMemo(() => {
        const yearsList = searchText === '' ? years : years.filter((year) => year.text?.includes(searchText));
        return {
            headerMessage: !yearsList.length ? translate('common.noResultsFound') : '',
            data: yearsList.sort((a, b) => b.value - a.value),
        };
    }, [years, searchText, translate]);

    useEffect(() => {
        if (isVisible) {
            return;
        }
        setSearchText('');
    }, [isVisible]);

    const textInputOptions = useMemo(
        () => ({
            label: translate('yearPickerPage.selectYear'),
            value: searchText,
            onChangeText: (text: string) => setSearchText(text.replaceAll(CONST.REGEX.NON_NUMERIC, '').trim()),
            headerMessage,
            maxLength: 4,
            inputMode: CONST.INPUT_MODE.NUMERIC,
        }),
        [headerMessage, searchText, translate],
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={() => onClose?.()}
            onModalHide={onClose}
            shouldHandleNavigationBack
            shouldUseCustomBackdrop
            onBackdropPress={onClose}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="YearPickerModal"
            >
                <HeaderWithBackButton
                    title={translate('yearPickerPage.year')}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    data={data}
                    ListItem={RadioListItem}
                    onSelectRow={(option) => {
                        Keyboard.dismiss();
                        onYearChange?.(option.value);
                    }}
                    textInputOptions={textInputOptions}
                    initiallyFocusedItemKey={currentYear.toString()}
                    disableMaintainingScrollPosition
                    addBottomSafeAreaPadding
                    shouldStopPropagation
                    showScrollIndicator
                />
            </ScreenWrapper>
        </Modal>
    );
}

export default YearPickerModal;
