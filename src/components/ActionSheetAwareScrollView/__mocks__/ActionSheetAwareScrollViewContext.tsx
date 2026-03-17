import {createContext, useContext} from 'react';
import type {PropsWithChildren} from 'react';
import {INITIAL_ACTION_SHEET_STATE} from '@components/ActionSheetAwareScrollView/constants';
import type {
    ActionSheetAwareScrollViewActionsContextValue,
    ActionSheetAwareScrollViewContextValue,
    ActionSheetAwareScrollViewStateContextValue,
} from '@components/ActionSheetAwareScrollView/types';
import createSharedValueMock from '../../../../tests/utils/createSharedValueMock';

const NOOP = () => {};

const mockStateContextValue: ActionSheetAwareScrollViewStateContextValue = {
    currentActionSheetState: createSharedValueMock(INITIAL_ACTION_SHEET_STATE),
};

const mockActionsContextValue: ActionSheetAwareScrollViewActionsContextValue = {
    transitionActionSheetState: NOOP,
    transitionActionSheetStateWorklet: NOOP,
    resetStateMachine: NOOP,
};

const Actions = {} as const;

const States = {} as const;

const ActionSheetAwareScrollViewStateContext = createContext<ActionSheetAwareScrollViewStateContextValue>(mockStateContextValue);

const ActionSheetAwareScrollViewActionsContext = createContext<ActionSheetAwareScrollViewActionsContextValue>(mockActionsContextValue);

function ActionSheetAwareScrollViewProvider(props: PropsWithChildren) {
    return (
        <ActionSheetAwareScrollViewActionsContext.Provider value={mockActionsContextValue}>
            <ActionSheetAwareScrollViewStateContext.Provider value={mockStateContextValue}>{props.children}</ActionSheetAwareScrollViewStateContext.Provider>
        </ActionSheetAwareScrollViewActionsContext.Provider>
    );
}

function useActionSheetAwareScrollViewState(): ActionSheetAwareScrollViewStateContextValue {
    return useContext(ActionSheetAwareScrollViewStateContext);
}

function useActionSheetAwareScrollViewActions(): ActionSheetAwareScrollViewActionsContextValue {
    return useContext(ActionSheetAwareScrollViewActionsContext);
}

const mockContextValue: ActionSheetAwareScrollViewContextValue = {...mockStateContextValue, ...mockActionsContextValue};

export {ActionSheetAwareScrollViewProvider, Actions, States, useActionSheetAwareScrollViewState, useActionSheetAwareScrollViewActions, mockContextValue};
