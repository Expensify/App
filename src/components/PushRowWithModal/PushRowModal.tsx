import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';

import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelection from '@hooks/useInitialSelection';
import useLocalize from '@hooks/useLocalize';

import searchOptions from '@libs/searchOptions';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import StringUtils from '@libs/StringUtils';

import CONST from '@src/CONST';

import React, {useMemo} from 'react';

type PushRowModalProps = {
    isVisible: boolean;

    /** Rows toggle instead of closing the modal, and a Save button commits the selection */
    canSelectMultiple?: boolean;

    selectedOptions: string[];

    /** Called with the row's key; the parent commits it or toggles it in its pending selection */
    onOptionChange: (option: string) => void;

    /** Called by the Save button when `canSelectMultiple` */
    onConfirm?: () => void;

    /** Function to call when the user closes the modal */
    onClose: () => void;

    optionsList: Record<string, string>;
    headerTitle: string;
    searchInputTitle?: string;
};

type ListItemType = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

function PushRowModal({isVisible, canSelectMultiple = false, selectedOptions, onOptionChange, onConfirm, onClose, optionsList, headerTitle, searchInputTitle}: PushRowModalProps) {
    const {translate} = useLocalize();

    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const initialSelectedValues = useInitialSelection(selectedOptions, {isVisible}) as string[];

    const options = useMemo(
        () =>
            Object.entries(optionsList).map(([key, value]) => ({
                value: key,
                text: value,
                keyForList: key,
                isSelected: selectedOptions.includes(key),
                searchValue: StringUtils.sanitizeString(value),
            })),
        [optionsList, selectedOptions],
    );

    const orderedOptions = moveInitialSelectionToTop(options, initialSelectedValues);

    const handleSelectRow = (option: ListItemType) => {
        onOptionChange(option.value);
        if (!canSelectMultiple) {
            onClose();
        }
    };

    const handleClose = () => {
        onClose();
        setSearchValue('');
    };

    const searchResults = searchOptions(debouncedSearchValue, debouncedSearchValue ? options : orderedOptions);

    const textInputOptions = useMemo(
        () => ({
            headerMessage: debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '',
            label: searchInputTitle,
            value: searchValue,
            onChangeText: setSearchValue,
        }),
        [debouncedSearchValue, searchInputTitle, searchResults.length, searchValue, setSearchValue, translate],
    );

    return (
        <Modal
            onClose={handleClose}
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            onModalHide={handleClose}
            shouldUseCustomBackdrop
            shouldHandleNavigationBack
        >
            <ScreenWrapper
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID="PushRowModal"
            >
                <HeaderWithBackButton
                    title={headerTitle}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    data={searchResults}
                    canSelectMultiple={canSelectMultiple}
                    ListItem={canSelectMultiple ? MultiSelectListItem : SingleSelectListItem}
                    onSelectRow={handleSelectRow}
                    onSelectionButtonPress={canSelectMultiple ? handleSelectRow : undefined}
                    confirmButtonOptions={canSelectMultiple ? {showButton: true, text: translate('common.save'), onConfirm} : undefined}
                    textInputOptions={textInputOptions}
                    searchValueForFocusSync={debouncedSearchValue}
                    initiallyFocusedItemKey={initialSelectedValues.at(0)}
                    disableMaintainingScrollPosition
                    shouldShowTooltips={false}
                    showScrollIndicator
                />
            </ScreenWrapper>
        </Modal>
    );
}

export default PushRowModal;
