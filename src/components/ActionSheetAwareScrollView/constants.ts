import type {ActionSheetAwareScrollViewState} from './types';

/** Holds all information that is needed to coordinate the state value for the action sheet state machine. */
const INITIAL_ACTION_SHEET_STATE: ActionSheetAwareScrollViewState = {
    previous: {
        state: 'idle',
        payload: null,
    },
    current: {
        state: 'idle',
        payload: null,
    },
};

// eslint-disable-next-line import/prefer-default-export
export {INITIAL_ACTION_SHEET_STATE};
