import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
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

    const handleClose = () => {
        onClose();
        setSearchValue('');
    };

    const searchResults = searchOptions(debouncedSearchValue, options);

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
                    ListItem={RadioListItem}
                    onSelectRow={handleSelectRow}
                    textInputOptions={textInputOptions}
                    initiallyFocusedItemKey={selectedOption}
                    disableMaintainingScrollPosition
                    shouldShowTooltips={false}
                    showScrollIndicator
                />
            </ScreenWrapper>
        </Modal>
    );
}

export default PushRowModal;
