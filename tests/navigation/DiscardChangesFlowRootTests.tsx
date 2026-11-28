import {act, waitFor} from '@testing-library/react-native';

import type {DiscardChangesConfirmation} from '@hooks/useDiscardChangesConfirmation/types';
import type UseDiscardChangesConfirmationOptions from '@hooks/useDiscardChangesConfirmation/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {suppressFlowDiscardPrompt} from '@libs/Navigation/helpers/discardPromptState';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type * as ReactNavigation from '@react-navigation/native';

import {StackActions} from '@react-navigation/native';

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

const STEP_PARAMS = {action: CONST.IOU.ACTION.CREATE, iouType: CONST.IOU.TYPE.CREATE, transactionID: '1', reportID: '1'};

describe.each([
    ['web', useWebDiscardChangesConfirmation],
    ['native', useNativeDiscardChangesConfirmation],
])('Discarding changes from the first screen of a flow (%s)', (_, useDiscardChangesConfirmation) => {
    /** The flow's first screen, which has unsaved changes and keeps guarding the flow while later steps cover it */
    function DirtyFlowRoot() {
        useDiscardChangesConfirmation({getHasUnsavedChanges: () => true, shouldPromptWhenUnfocused: true});
        return null;
    }

    /** A later create expense step with unsaved changes of its own, such as Distance opened from Confirmation with a new distance */
    function DirtyStep() {
        useDiscardChangesConfirmation({getHasUnsavedChanges: () => true, shouldCloseRHPOnDiscard: true});
        return null;
    }

    function renderFlow(stepComponents: Parameters<typeof renderMoneyRequestNavigation>[0]['stepComponents'] = {}) {
        renderMoneyRequestNavigation({
            openSteps: [SCREENS.MONEY_REQUEST.CREATE, SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION, SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TIME],
            stepComponents: {[SCREENS.MONEY_REQUEST.CREATE]: DirtyFlowRoot, ...stepComponents},
            stepParams: STEP_PARAMS,
        });
    }

    beforeEach(() => {
        resetMockConfirmModal();
        jest.mocked(getIsNarrowLayout).mockReturnValue(true);
        jest.mocked(useResponsiveLayout).mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: true});
    });

    it('lets the user go back between steps without asking', () => {
        // Given a flow whose first screen has unsaved changes, with two later steps on top of it
        renderFlow();

        // When the user goes back from the top step
        act(() => {
            navigationRef.current?.goBack();
        });

        // Then the step closes without asking, since the first screen and its draft stay
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(getMoneyRequestStepNames()).toEqual([SCREENS.MONEY_REQUEST.CREATE, SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION]);
    });

    it('asks when the user clicks outside the RHP from a later step, and closes the whole RHP on Discard', async () => {
        // Given a flow whose first screen has unsaved changes, covered by later steps
        renderFlow();

        // When the user clicks outside the RHP from the top step
        clickOutsideRHP();

        // Then the first screen asks, even though it isn't the one on top
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);

        // When the user picks Discard
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});

        // Then the whole RHP closes
        await waitFor(() => expect(getRootRouteNames()).toEqual([NAVIGATORS.TAB_NAVIGATOR]));
    });

    it('keeps every step open when the user cancels', async () => {
        // Given a flow whose first screen has unsaved changes, covered by later steps
        renderFlow();

        // When the user clicks outside the RHP and cancels the prompt
        clickOutsideRHP();
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        await act(async () => {
            resolveShowConfirmModal({action: MockModalActions.CLOSE});
        });

        // Then the user stays on the same step, with the flow as it was
        expect(getMoneyRequestStepNames()).toEqual([SCREENS.MONEY_REQUEST.CREATE, SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION, SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TIME]);
    });

    it('asks when the user presses Esc from a later step', async () => {
        // Given a flow whose first screen has unsaved changes, covered by later steps
        renderFlow();

        // When the user presses Esc, which dismisses the RHP, and picks Discard
        act(() => {
            Navigation.dismissModal();
        });
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});

        // Then the whole RHP closes
        await waitFor(() => expect(getRootRouteNames()).toEqual([NAVIGATORS.TAB_NAVIGATOR]));
    });

    it('closes the flow without asking while code that closes it on purpose has muted the prompt', () => {
        // Given a flow whose first screen has unsaved changes, and a submit from a later step that muted the prompt
        renderFlow();
        suppressFlowDiscardPrompt();

        // When the submit closes the RHP
        act(() => {
            Navigation.dismissModal();
        });

        // Then the RHP closes without asking to discard the expense that was just created
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(getRootRouteNames()).toEqual([NAVIGATORS.TAB_NAVIGATOR]);
    });

    it('asks only once when a later step with its own changes is on top, and closes the whole RHP on Discard', async () => {
        // Given a flow whose first screen has unsaved changes, under a step that has unsaved changes of its own
        renderFlow({[SCREENS.MONEY_REQUEST.DYNAMIC_STEP_TIME]: DirtyStep});

        // When the user clicks outside the RHP
        clickOutsideRHP();

        // Then only one prompt shows
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);

        // When the user picks Discard
        resolveShowConfirmModal({action: MockModalActions.CONFIRM});

        // Then the first screen doesn't ask again, and the whole RHP closes
        await waitFor(() => expect(getRootRouteNames()).toEqual([NAVIGATORS.TAB_NAVIGATOR]));
        expect(mockShowConfirmModal).toHaveBeenCalledTimes(1);
    });

    it('lets the first screen be replaced by another screen of the flow without asking', () => {
        // Given a flow that only has its first screen open, with unsaved changes
        renderMoneyRequestNavigation({
            openSteps: [SCREENS.MONEY_REQUEST.CREATE],
            stepComponents: {[SCREENS.MONEY_REQUEST.CREATE]: DirtyFlowRoot},
            stepParams: STEP_PARAMS,
        });

        // When going back opens another screen of the flow in its place, like the header back of a dropped receipt's confirmation
        const flowStackKey = navigationRef.current?.getRootState().routes.at(-1)?.state?.routes.at(0)?.state?.key;
        act(() => {
            navigationRef.current?.dispatch({...StackActions.replace(SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION, STEP_PARAMS), target: flowStackKey});
        });

        // Then the user stays in the flow without being asked
        expect(mockShowConfirmModal).not.toHaveBeenCalled();
        expect(getMoneyRequestStepNames()).toEqual([SCREENS.MONEY_REQUEST.DYNAMIC_STEP_DESTINATION]);
    });
});
