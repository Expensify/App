import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import useOnyx from '@hooks/useOnyx';

import toggleArrayItem from '@libs/toggleArrayItem';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import KeyboardUtils from '@src/utils/keyboard';

import type {StyleProp, ViewStyle} from 'react-native';

import {authTokenTypeSelector} from '@selectors/Session';
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

    /** The row cannot be opened for now, such as offline, and shows as dimmed instead of as plain text like a row whose option never changes */
    disabled?: boolean;

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
    /** Rows toggle checkboxes, and the modal's Save button commits the selection. Pair it with `valueType="stringList"`, so the form starts the answer as a list. */
    canSelectMultiple: true;

    value?: string[];

    /** Function called with the whole selection when the modal is saved */
    onInputChange?: (value: string[]) => void;
};

type PushRowWithModalProps = PushRowWithModalBaseProps & (PushRowWithModalSingleProps | PushRowWithModalMultipleProps);

function PushRowWithModal(props: PushRowWithModalProps) {
    const {optionsList, wrapperStyles, description, modalHeaderTitle, searchInputTitle, shouldAllowChange = true, disabled = false, errorText, onBlur = () => {}} = props;
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pendingSelection, setPendingSelection] = useState<string[]>([]);
    const shouldBlurOnCloseRef = useRef(true);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    let selection: string[] = [];
    if (props.canSelectMultiple) {
        // A form value can start as '' when no list valueType is set
        selection = Array.isArray(props.value) ? props.value : [];
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
        // A key missing from optionsList has no row to deselect, so saving drops it
        setPendingSelection(selection.filter((key) => Object.hasOwn(optionsList, key)));
        setIsModalVisible(true);
    };

    const handleOptionChange = (optionValue: string) => {
        if (props.canSelectMultiple) {
            setPendingSelection((previousSelection) => toggleArrayItem(previousSelection, optionValue));
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
            <MenuItem.Root
                onPress={shouldAllowChange ? callIfAuthenticated(handleModalOpen, session) : undefined}
                style={wrapperStyles}
                isDisabled={disabled}
                sentryLabel={CONST.SENTRY_LABEL.PUSH_ROW_WITH_MODAL.OPEN}
            >
                <MenuItemField.Row
                    name={description}
                    value={selection
                        .map((key) => optionsList[key])
                        .filter(Boolean)
                        .join(', ')}
                >
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    {shouldAllowChange && <MenuItem.Chevron />}
                </MenuItemField.Row>
                {!!errorText && <MenuItem.HelpText message={errorText} isError />}
            </MenuItem.Root>
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
