import {act, renderHook} from '@testing-library/react-native';
import useNavigateBackOnSave from '@hooks/useNavigateBackOnSave';
import Navigation from '@libs/Navigation/Navigation';
import {skipNextFocusRestore} from '@libs/NavigationFocusReturn';
import type {Route} from '@src/ROUTES';

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {goBack: jest.fn()},
}));

jest.mock('@libs/NavigationFocusReturn', () => ({
    __esModule: true,
    skipNextFocusRestore: jest.fn(),
}));

const mockGoBack = jest.mocked(Navigation.goBack);
const mockSkip = jest.mocked(skipNextFocusRestore);

const BACK_TO = 'settings/profile' as Route;

function renderSave(initialIsSaved = false, backTo: Route | undefined = BACK_TO, shouldSkipFocusRestore = true) {
    return renderHook(({isSaved}: {isSaved: boolean}) => useNavigateBackOnSave(isSaved, backTo, {shouldSkipFocusRestore}), {initialProps: {isSaved: initialIsSaved}});
}

beforeEach(() => {
    mockGoBack.mockReset();
    mockSkip.mockReset();
});

describe('useNavigateBackOnSave', () => {
    it('navigates back once isSaved flips after arming (save path)', () => {
        const {result, rerender} = renderSave();
        act(() => result.current.armNavigateBack());
        expect(mockGoBack).not.toHaveBeenCalled();

        rerender({isSaved: true});
        expect(mockSkip).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(BACK_TO);
    });

    it('skips focus restore BEFORE navigating, so the follow-up Enter hits the page shortcut and not the re-focused row (#90838)', () => {
        const order: string[] = [];
        mockSkip.mockImplementation(() => order.push('skip'));
        mockGoBack.mockImplementation(() => order.push('goBack'));

        const {result, rerender} = renderSave();
        act(() => result.current.armNavigateBack());
        rerender({isSaved: true});

        expect(order).toEqual(['skip', 'goBack']);
    });

    it('does NOT skip focus restore when shouldSkipFocusRestore is false (editing an existing expense), but still navigates back', () => {
        const {result, rerender} = renderSave(false, BACK_TO, false);
        act(() => result.current.armNavigateBack());
        rerender({isSaved: true});

        expect(mockSkip).not.toHaveBeenCalled();
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(BACK_TO);
    });

    it('does nothing when isSaved flips true without arming (an unrelated save elsewhere must not navigate)', () => {
        const {rerender} = renderSave();
        rerender({isSaved: true});
        expect(mockSkip).not.toHaveBeenCalled();
        expect(mockGoBack).not.toHaveBeenCalled();
    });

    it('waits for the save to land — arming while isSaved is still false defers nav until it flips', () => {
        const {result, rerender} = renderSave();
        act(() => result.current.armNavigateBack());
        rerender({isSaved: false});
        expect(mockGoBack).not.toHaveBeenCalled();

        rerender({isSaved: true});
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('navigateBack (Back button) goes back WITHOUT skipping focus restore', () => {
        const {result} = renderSave();
        act(() => result.current.navigateBack());
        expect(mockGoBack).toHaveBeenCalledWith(BACK_TO);
        expect(mockSkip).not.toHaveBeenCalled();
    });

    it('is one-shot — a second isSaved cycle without re-arming does not navigate again', () => {
        const {result, rerender} = renderSave();
        act(() => result.current.armNavigateBack());
        rerender({isSaved: true});
        expect(mockGoBack).toHaveBeenCalledTimes(1);

        rerender({isSaved: false});
        rerender({isSaved: true});
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('forwards the backTo target to goBack', () => {
        const other = 'settings/wallet' as Route;
        const {result} = renderSave(false, other);
        act(() => result.current.navigateBack());
        expect(mockGoBack).toHaveBeenCalledWith(other);
    });

    it('navigates when `armNavigateBack` is called while `isSaved` is already true (draft-already-matches-stored: setIsSaved(true) is a no-op)', () => {
        const {result} = renderSave(true);
        act(() => result.current.armNavigateBack());
        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(BACK_TO);
    });

    it('a fresh save cycle (isSaved false → true) re-opens the gate so a long-lived consumer can navigate again after re-arming', () => {
        const {result, rerender} = renderSave();
        act(() => result.current.armNavigateBack());
        rerender({isSaved: true});
        expect(mockGoBack).toHaveBeenCalledTimes(1);

        rerender({isSaved: false});
        act(() => result.current.armNavigateBack());
        rerender({isSaved: true});
        expect(mockGoBack).toHaveBeenCalledTimes(2);
    });

    it('double-tap on save while already saved navigates exactly once (defends the within-cycle invariant against rapid repeat arms)', () => {
        const {result} = renderSave(true);
        act(() => {
            result.current.armNavigateBack();
            result.current.armNavigateBack();
        });
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('within a single save cycle, repeat arms after the first navigate are no-ops (no double-pop)', () => {
        const {result, rerender} = renderSave();
        act(() => result.current.armNavigateBack());
        rerender({isSaved: true});
        expect(mockGoBack).toHaveBeenCalledTimes(1);

        // No `isSaved` cycle reset: a second arm should be ignored.
        act(() => result.current.armNavigateBack());
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('an intra-cycle re-arm is cleared so it cannot auto-fire on the next isSaved cycle (effect clears stale `isArmed` on the hasNavigated bail)', () => {
        const {result, rerender} = renderSave();
        act(() => result.current.armNavigateBack());
        rerender({isSaved: true});
        expect(mockGoBack).toHaveBeenCalledTimes(1);

        // Intra-cycle re-arm: the effect must clear the stale `isArmed` so it doesn't survive into the next cycle.
        act(() => result.current.armNavigateBack());
        expect(mockGoBack).toHaveBeenCalledTimes(1);

        // Fresh `isSaved` false→true edge resets `hasNavigated`. Without the bail-path clear, the leftover `isArmed=true` would auto-fire here.
        rerender({isSaved: false});
        rerender({isSaved: true});
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('snapshots `shouldSkipFocusRestore` at arm time — a later prop change cannot flip focus-restore behavior between arm and save', () => {
        const {result, rerender} = renderHook(
            ({isSaved, shouldSkipFocusRestore}: {isSaved: boolean; shouldSkipFocusRestore: boolean}) => useNavigateBackOnSave(isSaved, BACK_TO, {shouldSkipFocusRestore}),
            {
                initialProps: {isSaved: false as boolean, shouldSkipFocusRestore: true},
            },
        );

        act(() => result.current.armNavigateBack());
        rerender({isSaved: false, shouldSkipFocusRestore: false});
        rerender({isSaved: true, shouldSkipFocusRestore: false});

        // shouldSkipFocusRestore was true at arm time — snapshot must win over the later prop change.
        expect(mockSkip).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });

    it('snapshots `backTo` at arm time — a later prop change cannot strand the user (e.g. parent clears route.params between arm and save)', () => {
        const initial = 'settings/profile' as Route;
        const later = 'settings/wallet' as Route;

        const {result, rerender} = renderHook(({isSaved, backTo}: {isSaved: boolean; backTo: Route | undefined}) => useNavigateBackOnSave(isSaved, backTo, {shouldSkipFocusRestore: false}), {
            initialProps: {isSaved: false as boolean, backTo: initial as Route | undefined},
        });

        act(() => result.current.armNavigateBack());
        // The parent clears/changes backTo before the save flips.
        rerender({isSaved: false, backTo: later});
        rerender({isSaved: true, backTo: later});

        expect(mockGoBack).toHaveBeenCalledTimes(1);
        expect(mockGoBack).toHaveBeenCalledWith(initial);
    });
});
