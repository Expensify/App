import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useRef, useState} from 'react';

import PushRowModal from './PushRowModal';

type PushRowWithModalCommonProps = {
    /** The list of options that we want to display where key is option code and value is option name */
    optionsList: Record<string, string>;

    /** Additional styles to apply to container */
    wrapperStyles?: StyleProp<ViewStyle>;

    /** The description for the picker */
    description: string;

    modalHeaderTitle: string;
    searchInputTitle: string;

    /** Whether the selected option is editable */
    shouldAllowChange?: boolean;

    /** Text to display on error message */
    errorText?: string;

    stateInputIDToReset?: string;

    /**  Callback to call when the picker modal is dismissed */
    onBlur?: () => void;
};

type PushRowWithModalSingleProps = {
    canSelectMultiple?: false;

    value?: string;

    /** Function called whenever list item is selected */
    onInputChange?: (value: string, key?: string) => void;
};

type PushRowWithModalMultipleProps = {
    /** Rows toggle checkboxes and the modal commits the selection with a Save button */
    canSelectMultiple: true;

    value?: string[];

    /** Function called with the whole selection when the modal is saved */
    onInputChange?: (value: string[]) => void;
};

type PushRowWithModalProps = PushRowWithModalCommonProps & (PushRowWithModalSingleProps | PushRowWithModalMultipleProps);

function PushRowWithModal(props: PushRowWithModalProps) {
    const {optionsList, wrapperStyles, description, modalHeaderTitle, searchInputTitle, shouldAllowChange = true, errorText, stateInputIDToReset, onBlur = () => {}} = props;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pendingSelection, setPendingSelection] = useState<string[]>([]);
    const shouldBlurOnCloseRef = useRef(true);

    let committedSelection: string[] = [];
    if (props.canSelectMultiple) {
        committedSelection = props.value ?? [];
    } else if (props.value) {
        committedSelection = [props.value];
    }
    const title = committedSelection.map((key) => optionsList[key]).join(', ');

    const handleModalClose = () => {
        if (shouldBlurOnCloseRef.current) {
            onBlur?.();
        }
        KeyboardUtils.dismiss().then(() => {
            setIsModalVisible(false);
        });
    };

    const handleModalOpen = () => {
        setPendingSelection(committedSelection);
        setIsModalVisible(true);
    };

    const handleOptionChange = (optionValue: string) => {
        if (props.canSelectMultiple) {
            setPendingSelection((previous) => (previous.includes(optionValue) ? previous.filter((key) => key !== optionValue) : [...previous, optionValue]));
            return;
        }
        props.onInputChange?.(optionValue);
        shouldBlurOnCloseRef.current = false;
        if (stateInputIDToReset) {
            props.onInputChange?.('', stateInputIDToReset);
        }
    };

    const handleConfirm = () => {
        if (props.canSelectMultiple) {
            props.onInputChange?.(pendingSelection);
        }
        handleModalClose();
    };

    return (
        <>
            <MenuItemWithTopDescription
                description={description}
                title={title}
                shouldShowRightIcon={shouldAllowChange}
                onPress={handleModalOpen}
                wrapperStyle={wrapperStyles}
                interactive={shouldAllowChange}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
            />
            <PushRowModal
                isVisible={isModalVisible}
                canSelectMultiple={!!props.canSelectMultiple}
                selectedOptions={props.canSelectMultiple ? pendingSelection : committedSelection}
                onOptionChange={handleOptionChange}
                onConfirm={handleConfirm}
                onClose={handleModalClose}
                optionsList={optionsList}
                headerTitle={modalHeaderTitle}
                searchInputTitle={searchInputTitle}
            />
        </>
    );
}

export default PushRowWithModal;
