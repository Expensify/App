import {createContext} from 'react';
import type {PropsWithChildren} from 'react';
import {INITIAL_ACTION_SHEET_STATE} from '@components/ActionSheetAwareScrollView/constants';
import type {ActionSheetAwareScrollViewContextValue} from '@components/ActionSheetAwareScrollView/types';
import createSharedValueMock from '../../../../tests/utils/createSharedValueMock';

const NOOP = () => {};

const mockContextValue: ActionSheetAwareScrollViewContextValue = {
    currentActionSheetState: createSharedValueMock(INITIAL_ACTION_SHEET_STATE),
    transitionActionSheetState: NOOP,
    transitionActionSheetStateWorklet: NOOP,
    resetStateMachine: NOOP,
};

const Actions = {} as const;

const States = {} as const;

const ActionSheetAwareScrollViewContext = createContext<ActionSheetAwareScrollViewContextValue>(mockContextValue);

function ActionSheetAwareScrollViewProvider(props: PropsWithChildren) {
    return <ActionSheetAwareScrollViewContext.Provider value={mockContextValue}>{props.children}</ActionSheetAwareScrollViewContext.Provider>;
}

export {ActionSheetAwareScrollViewContext, ActionSheetAwareScrollViewProvider, Actions, States};
