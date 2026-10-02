import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';

import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useRef, useState} from 'react';

import PushRowModal from './PushRowModal';

type PushRowWithModalBaseProps = {
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

    /**  Callback to call when the picker modal is dismissed */
    onBlur?: () => void;
};

type PushRowWithModalSingleProps = {
    canSelectMultiple?: false;

    value?: string;

    /** Function called whenever list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    stateInputIDToReset?: string;
};

type PushRowWithModalMultipleProps = {
    /** Rows toggle checkboxes, and the modal's Save button commits the selection */
    canSelectMultiple: true;

    value?: string[];

    /** Function called with the whole selection when the modal is saved */
    onInputChange?: (value: string[]) => void;
};

type PushRowWithModalProps = PushRowWithModalBaseProps & (PushRowWithModalSingleProps | PushRowWithModalMultipleProps);

function PushRowWithModal(props: PushRowWithModalProps) {
    const {optionsList, wrapperStyles, description, modalHeaderTitle, searchInputTitle, shouldAllowChange = true, errorText, onBlur = () => {}} = props;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pendingSelection, setPendingSelection] = useState<string[]>([]);
    const shouldBlurOnCloseRef = useRef(true);

    let selection: string[] = [];
    if (props.canSelectMultiple) {
        // A form value can start as '' when no list valueType is set, and a key the options no longer offer could not be unchecked
        selection = Array.isArray(props.value) ? props.value.filter((key) => Object.hasOwn(optionsList, key)) : [];
    } else if (props.value) {
        selection = [props.value];
    }

    const handleModalClose = () => {
        if (shouldBlurOnCloseRef.current) {
            onBlur?.();
        }
        KeyboardUtils.dismiss().then(() => {
            setIsModalVisible(false);
        });
    };

    const handleModalOpen = () => {
        setPendingSelection(selection);
        setIsModalVisible(true);
    };

    const handleOptionChange = (optionValue: string) => {
        if (props.canSelectMultiple) {
            setPendingSelection((previousSelection) =>
                previousSelection.includes(optionValue) ? previousSelection.filter((key) => key !== optionValue) : [...previousSelection, optionValue],
            );
            return;
        }
        props.onInputChange?.(optionValue);
        shouldBlurOnCloseRef.current = false;
        if (props.stateInputIDToReset) {
            props.onInputChange?.('', props.stateInputIDToReset);
        }
    };

    const saveSelection = () => {
        if (props.canSelectMultiple) {
            props.onInputChange?.(pendingSelection);
        }
        shouldBlurOnCloseRef.current = false;
        handleModalClose();
    };

    return (
        <>
            <MenuItemWithTopDescription
                description={description}
                title={selection
                    .map((key) => optionsList[key])
                    .filter(Boolean)
                    .join(', ')}
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
                selectedOptions={props.canSelectMultiple ? pendingSelection : selection}
                onOptionChange={handleOptionChange}
                onConfirm={saveSelection}
                onClose={handleModalClose}
                optionsList={optionsList}
                headerTitle={modalHeaderTitle}
                searchInputTitle={searchInputTitle}
            />
        </>
    );
}

export default PushRowWithModal;
