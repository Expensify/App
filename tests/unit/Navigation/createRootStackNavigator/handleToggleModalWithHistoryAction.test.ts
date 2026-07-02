import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import {handleToggleModalWithHistoryAction} from '@libs/Navigation/AppNavigator/createRootStackNavigator/GetStateForActionHandlers';
import type {ToggleModalWithHistoryActionType} from '@libs/Navigation/AppNavigator/createRootStackNavigator/types';
import type {CustomHistoryEntry} from '@libs/Navigation/AppNavigator/routerExtensions/types';
import CONST from '@src/CONST';

type TestState = StackNavigationState<ParamListBase> & {history?: CustomHistoryEntry[]};

const MODAL = CONST.NAVIGATION.CUSTOM_HISTORY_ENTRY_MODAL;
const TOGGLE_MODAL_WITH_HISTORY = CONST.NAVIGATION.ACTION_TYPE.TOGGLE_MODAL_WITH_HISTORY;

const tag = (modalId: string) => `${MODAL}:${modalId}`;

function makeState(history: CustomHistoryEntry[]): TestState {
    const routes = history.filter((entry): entry is Exclude<CustomHistoryEntry, string> => typeof entry !== 'string');
    return {
        key: 'stack-test',
        index: routes.length - 1,
        routeNames: routes.map((route) => route.name),
        routes,
        type: 'stack',
        stale: false as const,
        preloadedRoutes: [],
        history,
    } as TestState;
}

const makeAction = (isVisible: boolean, modalId: string): ToggleModalWithHistoryActionType =>
    ({type: TOGGLE_MODAL_WITH_HISTORY, payload: {isVisible, modalId}}) as ToggleModalWithHistoryActionType;

const route = (key: string, name = 'Screen'): CustomHistoryEntry => ({key, name}) as CustomHistoryEntry;

describe('handleToggleModalWithHistoryAction', () => {
    it('appends a uniquely-tagged sentinel on open', () => {
        const state = makeState([route('page')]);

        const result = handleToggleModalWithHistoryAction(state, makeAction(true, 'a'));

        expect(result.history).toEqual([route('page'), tag('a')]);
    });

    it('appends one sentinel per nested modal (no dedupe)', () => {
        const state = makeState([route('page'), tag('a')]);

        const result = handleToggleModalWithHistoryAction(state, makeAction(true, 'b'));

        expect(result.history).toEqual([route('page'), tag('a'), tag('b')]);
    });

    it('removes only its own tag on close, keeping sibling/nested modal sentinels (LIFO)', () => {
        const state = makeState([route('page'), tag('a'), tag('b')]);

        // Closing the inner modal (b) leaves the outer one (a) intact.
        const result = handleToggleModalWithHistoryAction(state, makeAction(false, 'b'));

        expect(result.history).toEqual([route('page'), tag('a')]);
    });

    it('removes the last matching tag when the same modalId appears more than once', () => {
        const state = makeState([route('page'), tag('a'), tag('a')]);

        const result = handleToggleModalWithHistoryAction(state, makeAction(false, 'a'));

        expect(result.history).toEqual([route('page'), tag('a')]);
    });

    it('is a no-op on close when the tag is absent (e.g. already consumed by forward navigation)', () => {
        const state = makeState([route('page'), route('newScreen')]);

        const result = handleToggleModalWithHistoryAction(state, makeAction(false, 'a'));

        expect(result).toBe(state);
    });

    it('returns the state untouched when history is undefined', () => {
        const state = {key: 'k', index: 0, routeNames: [], routes: [], type: 'stack', stale: false as const, preloadedRoutes: []} as TestState;

        const result = handleToggleModalWithHistoryAction(state, makeAction(true, 'a'));

        expect(result).toBe(state);
    });
});
