import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useEffect, useState} from 'react';
import {Keyboard} from 'react-native';

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

    /** Whether RIGHT_DOCKED modal should keep backdrop in narrow pane context */
    shouldEnableBackdropInNarrowPane?: boolean;
};

function YearPickerModal({isVisible, years, currentYear, onYearChange, onClose, shouldEnableBackdropInNarrowPane = false}: YearPickerModalProps) {
    const resolvedCurrentYear = currentYear ?? new Date().getFullYear();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchText, setSearchText] = useState('');
    const yearsList = searchText === '' ? years : years.filter((year) => year.text?.includes(searchText));
    const headerMessage = !yearsList.length ? translate('common.noResultsFound') : '';
    const data = yearsList.sort((a, b) => b.value - a.value);

    useEffect(() => {
        if (isVisible) {
            return;
        }
        setSearchText('');
    }, [isVisible]);

    const textInputOptions = {
        label: translate('yearPickerPage.selectYear'),
        value: searchText,
        onChangeText: (text: string) => setSearchText(text.replaceAll(CONST.REGEX.NON_NUMERIC, '').trim()),
        headerMessage,
        maxLength: 4,
        inputMode: CONST.INPUT_MODE.NUMERIC,
    };

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={() => onClose?.()}
            onModalHide={onClose}
            shouldHandleNavigationBack
            shouldUseCustomBackdrop
            onBackdropPress={onClose}
            shouldKeepRightDockedBackdropInNarrowPane={shouldEnableBackdropInNarrowPane}
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
                    ListItem={SingleSelectListItem}
                    onSelectRow={(option) => {
                        Keyboard.dismiss();
                        onYearChange?.(option.value);
                    }}
                    textInputOptions={textInputOptions}
                    initiallyFocusedItemKey={resolvedCurrentYear.toString()}
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
