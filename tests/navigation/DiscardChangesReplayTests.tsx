import {act, waitFor} from '@testing-library/react-native';

import type {DiscardChangesConfirmation} from '@hooks/useDiscardChangesConfirmation/types';
import type UseDiscardChangesConfirmationOptions from '@hooks/useDiscardChangesConfirmation/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigation from '@react-navigation/native';

import type * as MockUseConfirmModalUtil from '../utils/mockUseConfirmModal';

import {MockModalActions, mockShowConfirmModal, resetMockConfirmModal, resolveShowConfirmModal} from '../utils/mockUseConfirmModal';
import {clickOutsideRHP, getMoneyRequestStepNames, getRootRouteNames, renderMoneyRequestNavigation} from '../utils/MoneyRequestTestNavigator';

// The shared mock stubs `usePreventRemove`, which the native hook relies on, so this test uses the real module
jest.mock('@react-navigation/native', () => jest.requireActual<typeof ReactNavigation>('@react-navigation/native'));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@libs/getIsNarrowLayout', () => jest.fn());

jest.mock('@hooks/useConfirmModal', () => {
    const {default: mockUseConfirmModal} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return mockUseConfirmModal;
});

jest.mock('@components/Modal/Global/ModalContext', () => {
    const {createMockModalContextModule} = jest.requireActual<typeof MockUseConfirmModalUtil>('../utils/mockUseConfirmModal');
    return createMockModalContextModule();
});

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));

type DiscardHookModule = {default: (options: UseDiscardChangesConfirmationOptions) => DiscardChangesConfirmation};

// Jest resolves platform extensions native-first, so each implementation is loaded explicitly to run the same scenarios on both
const useWebDiscardChangesConfirmation = jest.requireActual<DiscardHookModule>('@hooks/useDiscardChangesConfirmation/index.ts').default;
const useNativeDiscardChangesConfirmation = jest.requireActual<DiscardHookModule>('@hooks/useDiscardChangesConfirmation/index.native.ts').default;

describe.each([
    ['web', useWebDiscardChangesConfirmation],
    ['native', useNativeDiscardChangesConfirmation],
])('Discarding changes on a step stacked in the RHP (%s)', (_, useDiscardChangesConfirmation) => {
    /** A create expense step with unsaved changes, which closes the whole RHP on Discard */
    function DirtyStep() {
        useDiscardChangesConfirmation({getHasUnsavedChanges: () => true, shouldCloseRHPOnDiscard: true});
        return null;
    }

    /** A page with unsaved changes outside the create expense flow, such as the agent avatar page */
    function DirtyPageOutsideCreateFlow() {
        useDiscardChangesConfirmation({getHasUnsavedChanges: () => true});
        return null;
    }

    function renderDirtyStepOverFirstStep(dirtyStep = DirtyStep) {
        renderMoneyRequestNavigation({
            openSteps: [SCREENS.MONEY_REQUEST.CREATE, SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION],
            stepComponents: {[SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION]: dirtyStep},
            stepParams: {action: CONST.IOU.ACTION.CREATE, iouType: CONST.IOU.TYPE.CREATE, transactionID: '1', reportID: '1'},
        });
    }

    beforeEach(() => {
        resetMockConfirmModal();
        jest.mocked(getIsNarrowLayout).mockReturnValue(true);
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    it('closes the whole RHP when the user clicks outside it and picks Discard', async () => {
        // Given a step with unsaved changes stacked on another step in the RHP
        renderDirtyStepOverFirstStep();

        // When the user clicks outside the RHP
        clickOutsideRHP();

        // Then the RHP stays open while the user is asked
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        expect(getRootRouteNames()).toEqual([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR]);

        // When the user picks Discard
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});

        // Then the whole RHP closes, as the click asked, instead of only the step on top. The web hook sends the navigation
        // again on the next animation frame, so wait for it.
        await waitFor(() => expect(getRootRouteNames()).toEqual([NAVIGATORS.TAB_NAVIGATOR]));
    });

    it('only closes a page outside the create expense flow when the user clicks outside the RHP and picks Discard', async () => {
        // Given a page with unsaved changes outside the create expense flow, stacked on another page in the RHP
        renderDirtyStepOverFirstStep(DirtyPageOutsideCreateFlow);

        // When the user clicks outside the RHP and picks Discard
        clickOutsideRHP();
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});

        // Then only that page closes and the RHP stays on the page below it, as before
        await waitFor(() => expect(getMoneyRequestStepNames()).toEqual([SCREENS.MONEY_REQUEST.CREATE]));
        expect(getRootRouteNames()).toEqual([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR]);
    });

    it('keeps the RHP and the step open when the user cancels', async () => {
        // Given a step with unsaved changes stacked on another step in the RHP
        renderDirtyStepOverFirstStep();

        // When the user clicks outside the RHP and cancels the prompt
        clickOutsideRHP();
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        await act(async () => {
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
        });

        // Then nothing closes, so the changes are still there
        expect(getRootRouteNames()).toEqual([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR]);
        expect(getMoneyRequestStepNames()).toEqual([SCREENS.MONEY_REQUEST.CREATE, SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION]);
    });

    it('closes the whole RHP when the user presses Esc and picks Discard', async () => {
        // Given a step with unsaved changes stacked on another step in the RHP
        renderDirtyStepOverFirstStep();

        // When the user presses Esc, which dismisses the modal, and picks Discard
        act(() => {
            Navigation.dismissModal();
        });
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});

        // Then the whole RHP closes
        await waitFor(() => expect(getRootRouteNames()).toEqual([NAVIGATORS.TAB_NAVIGATOR]));
    });

    it('only leaves the step when the user goes back from it and picks Discard', async () => {
        // Given a step with unsaved changes stacked on another step in the RHP
        renderDirtyStepOverFirstStep();

        // When the user goes back from the step, which the step's own stack handles, and picks Discard
        act(() => {
            navigationRef.current?.goBack();
        });
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});

        // Then only the step closes and the RHP stays on the step below it
        await waitFor(() => expect(getMoneyRequestStepNames()).toEqual([SCREENS.MONEY_REQUEST.CREATE]));
        expect(getRootRouteNames()).toEqual([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR]);
    });
});
