import React, {useEffect, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type RadioItem = {
    /** Text to display */
    text: string;

    /** Alternate text to display */
    alternateText?: string;

    /** Key used internally by React */
    keyForList: string;

    /** Whether this option is selected */
    isSelected?: boolean;

    /** Element to show on the right side of the item */
    rightElement?: undefined;

    /** Whether this option is disabled for selection */
    isDisabled?: undefined;

    invitedSecondaryLogin?: undefined;

    /** Errors that this user may contain */
    errors?: undefined;

    /** The type of action that's pending  */
    pendingAction?: undefined;

    sectionIndex: number; // smb throw this out

    index: number; // mb throw this out
};

type YearPickerModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** The list of years to render */
    years: RadioItem[];

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
        const yearsList = searchText === '' ? years : years.filter((year) => year.text.includes(searchText));
        return {
            headerMessage: !yearsList.length ? translate('common.noResultsFound') : '',
            sections: [{data: yearsList, indexOffset: 0}],
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
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={YearPickerModal.displayName}
            >
                <HeaderWithBackButton
                    title={translate('yearPickerPage.year')}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    shouldDelayFocus
                    textInputLabel={translate('yearPickerPage.selectYear')}
                    textInputValue={searchText}
                    textInputMaxLength={4}
                    onChangeText={(text: string) => setSearchText(text.replace(CONST.REGEX.NON_NUMERIC, '').trim())}
                    inputMode={CONST.INPUT_MODE.NUMERIC}
                    headerMessage={headerMessage}
                    sections={sections}
                    onSelectRow={(option) => onYearChange?.(option.value)}
                    initiallyFocusedOptionKey={currentYear.toString()}
                    showScrollIndicator
                    shouldStopPropagation
                />
            </ScreenWrapper>
        </Modal>
    );
}

YearPickerModal.displayName = 'YearPickerModal';

export default YearPickerModal;
