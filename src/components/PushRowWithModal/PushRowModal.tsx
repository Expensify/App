import React, {useEffect, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
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

    const allOptions = Object.entries(optionsList).map(([key, value]) => ({
        value: key,
        text: value,
        keyForList: key,
        isSelected: key === selectedOption,
    }));
    const [searchbarInputText, setSearchbarInputText] = useState('');
    const [optionListItems, setOptionListItems] = useState(allOptions);

    useEffect(() => {
        setOptionListItems((prevOptionListItems) =>
            prevOptionListItems.map((option) => ({
                ...option,
                isSelected: option.value === selectedOption,
            })),
        );
    }, [selectedOption]);

    const filterShownOptions = (searchText: string) => {
        setSearchbarInputText(searchText);
        const searchWords = searchText.toLowerCase().match(/[a-z0-9]+/g) ?? [];
        setOptionListItems(
            allOptions.filter((option) =>
                searchWords.every((word) =>
                    option.text
                        .toLowerCase()
                        .replace(/[^a-z0-9]/g, ' ')
                        .includes(word),
                ),
            ),
        );
    };

    const handleSelectRow = (option: ListItemType) => {
        onOptionChange(option.value);
        onClose();
    };

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
                    headerMessage={searchbarInputText.trim().length && !optionListItems.length ? translate('common.noResultsFound') : ''}
                    textInputLabel={searchInputTitle}
                    textInputValue={searchbarInputText}
                    onChangeText={filterShownOptions}
                    onSelectRow={handleSelectRow}
                    sections={[{data: optionListItems}]}
                    initiallyFocusedOptionKey={optionListItems.find((option) => option.value === selectedOption)?.keyForList}
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
