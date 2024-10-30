import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import CONST from '@src/CONST';
import PushRowModal from './PushRowModal';

type PushRowWithModalProps = {
    /** The list of options that we want to display where key is option code and value is option name */
    optionsList: Record<string, string>;

    /** Current value of the selected item */
    value?: string;

    /** Function called whenever list item is selected */
    onInputChange?: (value: string) => void;

    /** Additional styles to apply to container */
    wrapperStyles?: StyleProp<ViewStyle>;

    /** The description for the picker */
    description: string;

    /** The title of the modal */
    modalHeaderTitle: string;

    /** The title of the search input */
    searchInputTitle: string;

    /** Whether the selected option is editable */
    shouldAllowChange?: boolean;

    /** Text to display on error message */
    errorText?: string;
};

function PushRowWithModal({
    value,
    optionsList,
    wrapperStyles,
    description,
    modalHeaderTitle,
    searchInputTitle,
    shouldAllowChange = true,
    errorText,
    onInputChange = () => {},
}: PushRowWithModalProps) {
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleModalClose = () => {
        setIsModalVisible(false);
    };

    const handleModalOpen = () => {
        setIsModalVisible(true);
    };

    const handleOptionChange = (optionValue: string) => {
        onInputChange(optionValue);
    };

    return (
        <>
            <MenuItemWithTopDescription
                description={description}
                title={value ? optionsList[value] : ''}
                shouldShowRightIcon={shouldAllowChange}
                onPress={handleModalOpen}
                wrapperStyle={wrapperStyles}
                interactive={shouldAllowChange}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
            />
            <PushRowModal
                isVisible={isModalVisible}
                selectedOption={value ?? ''}
                onOptionChange={handleOptionChange}
                onClose={handleModalClose}
                optionsList={optionsList}
                headerTitle={modalHeaderTitle}
                searchInputTitle={searchInputTitle}
            />
        </>
    );
}

PushRowWithModal.displayName = 'PushRowWithModal';

export default PushRowWithModal;
