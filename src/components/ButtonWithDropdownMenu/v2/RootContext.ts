import {createContext, use} from 'react';
import type {Dispatch, RefObject, SetStateAction} from 'react';
import type {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ButtonWithDropdownMenuRootState = {
    isMenuVisible: boolean;
};

type ButtonWithDropdownMenuRootMeta = {
    /** Caret in split mode, Trigger in single-trigger mode. */
    dropdownAnchor: RefObject<View | null>;
    success: boolean;
    isDisabled: boolean;
    isLoading: boolean;
    buttonSize: ValueOf<typeof CONST.DROPDOWN_BUTTON_SIZE>;
    isCompactTrigger: boolean;
    brickRoadIndicator: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined;
    sentryLabel: string | undefined;
    testID: string | undefined;
};

type ButtonWithDropdownMenuRootStateValue = {
    state: ButtonWithDropdownMenuRootState;
    meta: ButtonWithDropdownMenuRootMeta;
};

type ButtonWithDropdownMenuRootActionsValue = {
    setIsMenuVisible: Dispatch<SetStateAction<boolean>>;
};

const ButtonWithDropdownMenuRootStateContext = createContext<ButtonWithDropdownMenuRootStateValue | null>(null);
ButtonWithDropdownMenuRootStateContext.displayName = 'ButtonWithDropdownMenuRootStateContext';

const ButtonWithDropdownMenuRootActionsContext = createContext<ButtonWithDropdownMenuRootActionsValue | null>(null);
ButtonWithDropdownMenuRootActionsContext.displayName = 'ButtonWithDropdownMenuRootActionsContext';

function useButtonWithDropdownMenuRootState(consumerName = 'useButtonWithDropdownMenuRootState'): ButtonWithDropdownMenuRootStateValue {
    const value = use(ButtonWithDropdownMenuRootStateContext);
    if (!value) {
        throw new Error(`\`${consumerName}\` must be called inside <ButtonWithDropdownMenuV2>`);
    }
    return value;
}

function useButtonWithDropdownMenuRootActions(consumerName = 'useButtonWithDropdownMenuRootActions'): ButtonWithDropdownMenuRootActionsValue {
    const value = use(ButtonWithDropdownMenuRootActionsContext);
    if (!value) {
        throw new Error(`\`${consumerName}\` must be called inside <ButtonWithDropdownMenuV2>`);
    }
    return value;
}

export {ButtonWithDropdownMenuRootStateContext, ButtonWithDropdownMenuRootActionsContext, useButtonWithDropdownMenuRootState, useButtonWithDropdownMenuRootActions};
export type {ButtonWithDropdownMenuRootStateValue, ButtonWithDropdownMenuRootActionsValue};
