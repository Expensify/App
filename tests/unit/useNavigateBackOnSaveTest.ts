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
});
