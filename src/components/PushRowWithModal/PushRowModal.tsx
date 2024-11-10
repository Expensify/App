import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import searchOptions from '@libs/searchOptions';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';

type PushRowModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** The currently selected option */
    selectedOption: string;

    /** Function to call when the user selects an option */
    onOptionChange: (option: string) => void;

    /** Function to call when the user closes the modal */
    onClose: () => void;

    /** The list of items to render */
    optionsList: Record<string, string>;

    /** The title of the modal */
    headerTitle: string;

    /** The title of the search input */
    searchInputTitle?: string;
};

type ListItemType = {
    value: string;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

function PushRowModal({isVisible, selectedOption, onOptionChange, onClose, optionsList, headerTitle, searchInputTitle}: PushRowModalProps) {
    const {translate} = useLocalize();

    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');

    const options = useMemo(
        () =>
            Object.entries(optionsList).map(([key, value]) => ({
                value: key,
                text: value,
                keyForList: key,
                isSelected: key === selectedOption,
                searchValue: StringUtils.sanitizeString(value),
            })),
        [optionsList, selectedOption],
    );

    const handleSelectRow = (option: ListItemType) => {
        onOptionChange(option.value);
        onClose();
    };

    const searchResults = searchOptions(debouncedSearchValue, options);
    const headerMessage = debouncedSearchValue.trim() && !searchResults.length ? translate('common.noResultsFound') : '';

    return (
        <Modal
            onClose={onClose}
            isVisible={isVisible}
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            onModalHide={onClose}
            shouldUseCustomBackdrop
            useNativeDriver
        >
            <ScreenWrapper
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={PushRowModal.displayName}
            >
                <HeaderWithBackButton
                    title={headerTitle}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    headerMessage={headerMessage}
                    textInputLabel={searchInputTitle}
                    textInputValue={searchValue}
                    onChangeText={setSearchValue}
                    onSelectRow={handleSelectRow}
                    sections={[{data: searchResults}]}
                    initiallyFocusedOptionKey={selectedOption}
                    showScrollIndicator
                    shouldShowTooltips={false}
                    ListItem={RadioListItem}
                />
            </ScreenWrapper>
        </Modal>
    );
}

PushRowModal.displayName = 'PushRowModal';

export type {ListItemType};

export default PushRowModal;
