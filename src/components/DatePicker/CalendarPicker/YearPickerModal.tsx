import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import {usePopoverActions} from '@components/PopoverProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import type {View} from 'react-native';

import React, {useEffect, useRef, useState} from 'react';
import {Keyboard} from 'react-native';

import type CalendarPickerListItem from './types';

type YearPickerModalProps = {
    isVisible: boolean;
    years: CalendarPickerListItem[];
    currentYear?: number;
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
    const {setActivePopoverExtraAnchorRef} = usePopoverActions();
    const contentRef = useRef<View>(null);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        if (!isVisible) {
            return;
        }

        // This modal is rendered above the calendar rather than inside it, so a press on a year counts as a press
        // outside the calendar popover and would dismiss it. Registering the content keeps the calendar open.
        setActivePopoverExtraAnchorRef(contentRef);
    }, [isVisible, setActivePopoverExtraAnchorRef]);

    const yearsList = searchText === '' ? years : years.filter((year) => year.text?.includes(searchText));
    const headerMessage = !yearsList.length ? translate('common.noResultsFound') : '';
    // Copy before sorting: with an empty search `yearsList` is the `years` prop itself, and sorting it in place would mutate the caller's state during render.
    const data = [...yearsList].sort((a, b) => b.value - a.value);

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
                ref={contentRef}
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
