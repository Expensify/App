import {act, fireEvent, render, screen} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import type useStyleUtils from '@hooks/useStyleUtils';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {buildQueryStringFromFilterFormValues} from '@libs/SearchQueryUtils';

import DynamicEditAgentPage from '@pages/settings/Agents/DynamicEditAgentPage';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../../../utils/createMock';
import waitForBatchedUpdates from '../../../utils/waitForBatchedUpdates';

type ParsableStyle = Parameters<ReturnType<typeof useStyleUtils>['parseStyleFromFunction']>[0];

jest.mock('@userActions/Agent', () => ({
    deleteAgent: jest.fn(),
    clearAgentUpdateError: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: (key: string) => key,
    })),
);

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@hooks/useStyleUtils', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: (_, prop) => {
                        if (prop === 'parseStyleFromFunction') {
                            return (style: ParsableStyle) =>
                                typeof style === 'function' ? style({pressed: false, focused: false, hovered: false, isScreenReaderActive: false, isDisabled: false}) : style;
                        }
                        return jest.fn(() => ({}));
                    },
                },
            ),
    ),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Trashcan: 1})),
}));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@react-navigation/native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        useIsFocused: () => true,
        useRoute: jest.fn(() => ({name: '', key: '', params: {}})),
    };
});

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeader({title}: {title: string}) {
        return title;
    }
    return MockHeader;
});

jest.mock('@components/ScrollView', () => {
    function MockScrollView({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScrollView;
});

jest.mock('@components/ConfirmModal', () => {
    function MockConfirmModal({confirmText}: {confirmText: string}) {
        return confirmText ?? null;
    }
    return MockConfirmModal;
});

jest.mock('@components/MenuItem/presets/MenuItemAction', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {Text} = jest.requireActual('react-native');
    return ({title, onPress, isDisabled}: {title: string; onPress?: () => void; isDisabled?: boolean}) => <Text onPress={isDisabled ? undefined : onPress}>{title}</Text>;
});

jest.mock('@components/OfflineWithFeedback', () => {
    function MockOfflineWithFeedback({children, errors}: {children: React.ReactNode; errors?: Record<string, unknown> | null}) {
        return (
            <>
                {children}
                {errors ? JSON.stringify(errors) : null}
            </>
        );
    }
    return MockOfflineWithFeedback;
});

jest.mock('@pages/ErrorPage/NotFoundPage', () => {
    function MockNotFoundPage() {
        return 'notFound.notHere';
    }
    return MockNotFoundPage;
});

const mockUseOnyx = jest.mocked(useOnyx);

// Runs the selector a component passed to useOnyx over a given personal details list
function selectFromPersonalDetails(selector: unknown, personalDetails: PersonalDetailsList) {
    // jest erases the generic type info, so the selector needs a narrowing assertion back to its real signature.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return (selector as (personalDetailsList: PersonalDetailsList) => NonNullable<unknown> | undefined)(personalDetails);
}

const TEST_ACCOUNT_ID = 12345;

type DynamicEditAgentPageRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT>['route'];
type DynamicEditAgentPageNavigation = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.DYNAMIC_EDIT>['navigation'];

const mockRoute = createMock<DynamicEditAgentPageRoute>({params: {accountID: TEST_ACCOUNT_ID}});
const mockSetParams = jest.fn();
const mockNavigation = createMock<DynamicEditAgentPageNavigation>({setParams: mockSetParams});

describe('DynamicEditAgentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockImplementation((key, options) => {
            if (key === ONYXKEYS.PERSONAL_DETAILS_LIST && options?.selector) {
                return [selectFromPersonalDetails(options.selector, {[TEST_ACCOUNT_ID]: {accountID: TEST_ACCOUNT_ID, displayName: 'Default Agent'}}), {status: 'loaded'}];
            }
            if (typeof key === 'string' && key.startsWith(ONYXKEYS.COLLECTION.AGENT)) {
                return [{prompt: 'Default prompt'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it('renders agent name from personalDetails', () => {
        mockUseOnyx.mockImplementation((key, options) => {
            if (key === ONYXKEYS.PERSONAL_DETAILS_LIST && options?.selector) {
                return [selectFromPersonalDetails(options.selector, {[TEST_ACCOUNT_ID]: {accountID: TEST_ACCOUNT_ID, displayName: 'Test Agent'}}), {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <DynamicEditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('Test Agent');
    });

    it('renders prompt from agent Onyx key', () => {
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.AGENT}${TEST_ACCOUNT_ID}`) {
                return [{prompt: 'Reject all gambling expenses.'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <DynamicEditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('Reject all gambling expenses.');
    });

    it('renders delete agent menu item', () => {
        const {toJSON} = render(
            <DynamicEditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('editAgentPage.deleteAgent');
    });

    it('navigates to the agent chat history search when the view agent history menu item is pressed', () => {
        mockUseOnyx.mockImplementation((key, options) => {
            if (key === ONYXKEYS.PERSONAL_DETAILS_LIST && options?.selector) {
                return [
                    selectFromPersonalDetails(options.selector, {[TEST_ACCOUNT_ID]: {accountID: TEST_ACCOUNT_ID, displayName: 'Test Agent', login: 'agent@expensify.com'}}),
                    {status: 'loaded'},
                ];
            }
            return [undefined, {status: 'loaded'}];
        });

        render(
            <DynamicEditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        fireEvent.press(screen.getByText('editAgentPage.viewAgentHistory'));

        const expectedQuery = buildQueryStringFromFilterFormValues({
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            from: [String(TEST_ACCOUNT_ID)],
        });
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SEARCH_ROOT.getRoute({query: expectedQuery, rawQuery: expectedQuery}));
    });

    it('shows error text when agent has nameErrors', () => {
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.AGENT}${TEST_ACCOUNT_ID}`) {
                return [{prompt: 'Some prompt', nameErrors: {someKey: 'agentsPage.error.updateName'}}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <DynamicEditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('agentsPage.error.updateName');
    });

    it('shows error text when agent has promptErrors', () => {
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.AGENT}${TEST_ACCOUNT_ID}`) {
                return [{prompt: 'Some prompt', promptErrors: {someKey: 'agentsPage.error.updatePrompt'}}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <DynamicEditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('agentsPage.error.updatePrompt');
    });

    it('renders NotFoundPage when agent and personalDetails are both missing after Onyx is loaded', () => {
        mockUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.IS_LOADING_APP) {
                return [false, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <DynamicEditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        const serialized = JSON.stringify(toJSON());
        expect(serialized).toContain('notFound.notHere');
        expect(serialized).not.toContain('editAgentPage.deleteAgent');
    });

    it('does not render NotFoundPage while Onyx is still loading', () => {
        mockUseOnyx.mockReturnValue([undefined, {status: 'loading'}]);

        const {toJSON} = render(
            <DynamicEditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).not.toContain('notFound.notHere');
    });

    describe('optimistic accountID replacement', () => {
        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
        });

        beforeEach(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.IS_LOADING_APP, false);
            await waitForBatchedUpdates();
            mockUseOnyx.mockImplementation(jest.requireActual<{default: typeof useOnyx}>('@hooks/useOnyx').default);
        });

        it('keeps an already-open Edit page usable when another tab replaces its optimistic agent', async () => {
            // Given an Edit screen is still showing the temporary agent while another tab finishes creation
            const optimisticAccountID = 5728193046572819;
            const realAccountID = 12346;
            const route = createMock<DynamicEditAgentPageRoute>({params: {accountID: optimisticAccountID}});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [optimisticAccountID]: {accountID: optimisticAccountID, displayName: 'Pending agent', isOptimisticPersonalDetail: true},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, {prompt: 'Pending instructions'});

            const {toJSON} = render(
                <DynamicEditAgentPage
                    route={route}
                    navigation={mockNavigation}
                />,
            );
            await act(async () => waitForBatchedUpdates());
            expect(JSON.stringify(toJSON())).toContain('Pending agent');

            // When this tab receives the latest shared state without its route having been redirected, the tab
            // processing CreateAgent has written the real data and removed the optimistic copies.
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[realAccountID]: {accountID: realAccountID, displayName: 'Created agent'}},
                    [`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}` as const]: {prompt: 'Created instructions'},
                    [`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}` as const]: null,
                    [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: {[optimisticAccountID]: realAccountID},
                });
                await waitForBatchedUpdates();
            });

            // Then the mounted screen resolves the real data and requests route repair without showing not-found
            expect(route.params.accountID).toBe(optimisticAccountID);
            expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)});
            expect(JSON.stringify(toJSON())).toContain('Created agent');
            expect(JSON.stringify(toJSON())).toContain('Created instructions');
            expect(JSON.stringify(toJSON())).not.toContain('notFound.notHere');

            // When the real agent is deleted, retaining its mapping must not resurrect the old data.
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[realAccountID]: null});
                await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`, null);
                await waitForBatchedUpdates();
            });
            // Then the screen reports not-found even though the temporary-to-real mapping remains
            expect(JSON.stringify(toJSON())).toContain('notFound.notHere');
        });

        it('keeps showing the temporary agent until the real agent and its details reach this tab', async () => {
            // Given an Edit screen showing the temporary agent in a tab that does not apply CreateAgent's response. Another
            // tab's writes reach it key by key: the mapping first, then the real agent's record, then the personal
            // details list that holds the real agent and no longer holds the temporary one.
            const optimisticAccountID = 7392018465730291;
            const realAccountID = 12348;
            const route = createMock<DynamicEditAgentPageRoute>({params: {accountID: optimisticAccountID}});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [optimisticAccountID]: {accountID: optimisticAccountID, displayName: 'Pending agent', isOptimisticPersonalDetail: true},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, {prompt: 'Pending instructions'});
            const {toJSON} = render(
                <DynamicEditAgentPage
                    route={route}
                    navigation={mockNavigation}
                />,
            );
            await act(async () => waitForBatchedUpdates());

            // When only the mapping has arrived
            await act(async () => {
                await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
                await waitForBatchedUpdates();
            });

            // Then the screen keeps the temporary agent, because this tab cannot show the real one yet
            expect(mockSetParams).not.toHaveBeenCalled();
            expect(JSON.stringify(toJSON())).toContain('Pending agent');
            expect(JSON.stringify(toJSON())).toContain('Pending instructions');
            expect(JSON.stringify(toJSON())).not.toContain('notFound.notHere');

            // When the real agent's record arrives, but not its personal details
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`, {prompt: 'Created instructions'});
                await waitForBatchedUpdates();
            });

            // Then the screen still shows the temporary agent, which still has its name to show
            expect(mockSetParams).not.toHaveBeenCalled();
            expect(JSON.stringify(toJSON())).toContain('Pending agent');
            expect(JSON.stringify(toJSON())).not.toContain('notFound.notHere');

            // When the personal details list arrives with the real agent's server details and without the temporary entry
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [realAccountID]: {accountID: realAccountID, displayName: 'Created agent', login: 'agent+12348@expensify.com'},
                    [optimisticAccountID]: null,
                });
                await waitForBatchedUpdates();
            });

            // Then the screen moves to the real agent and shows its data, and not-found was not shown at any of these steps
            expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)});
            expect(JSON.stringify(toJSON())).toContain('Created agent');
            expect(JSON.stringify(toJSON())).toContain('Created instructions');
            expect(JSON.stringify(toJSON())).not.toContain('notFound.notHere');
        });

        it('keeps the temporary agent when the personal details list reaches this tab before the real agent record', async () => {
            // Given an Edit screen showing the temporary agent in a tab that does not apply CreateAgent's response. Keys can
            // also arrive in the other order: the mapping, then the personal details list without the temporary entry, and
            // only then the real agent's record.
            const optimisticAccountID = 8203917465028173;
            const realAccountID = 12349;
            const route = createMock<DynamicEditAgentPageRoute>({params: {accountID: optimisticAccountID}});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [optimisticAccountID]: {accountID: optimisticAccountID, displayName: 'Pending agent', isOptimisticPersonalDetail: true},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${optimisticAccountID}`, {prompt: 'Pending instructions'});
            const {toJSON} = render(
                <DynamicEditAgentPage
                    route={route}
                    navigation={mockNavigation}
                />,
            );
            await act(async () => waitForBatchedUpdates());

            // When the mapping and the personal details list have arrived, but not the real agent's record
            await act(async () => {
                await Onyx.merge(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING, {[optimisticAccountID]: realAccountID});
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [realAccountID]: {accountID: realAccountID, displayName: 'Created agent', login: 'agent+12349@expensify.com'},
                    [optimisticAccountID]: null,
                });
                await waitForBatchedUpdates();
            });

            // Then the screen stays on the temporary agent and shows its record's instructions, waiting for the real agent's
            // record before it moves
            expect(mockSetParams).not.toHaveBeenCalled();
            expect(JSON.stringify(toJSON())).toContain('Pending instructions');
            expect(JSON.stringify(toJSON())).not.toContain('notFound.notHere');

            // When the real agent's record arrives
            await act(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}`, {prompt: 'Created instructions'});
                await waitForBatchedUpdates();
            });

            // Then the screen moves to the real agent and shows its data, and not-found was not shown at any of these steps
            expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)});
            expect(JSON.stringify(toJSON())).toContain('Created agent');
            expect(JSON.stringify(toJSON())).toContain('Created instructions');
            expect(JSON.stringify(toJSON())).not.toContain('notFound.notHere');
        });

        it('opens an optimistic route after creation has already completed', async () => {
            // Given creation has finished, leaving only the real agent data and its retained ID mapping
            const optimisticAccountID = 6849302751684930;
            const realAccountID = 12347;
            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[realAccountID]: {accountID: realAccountID, displayName: 'Already created agent'}},
                [`${ONYXKEYS.COLLECTION.AGENT}${realAccountID}` as const]: {prompt: 'Already created instructions'},
                [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: {[optimisticAccountID]: realAccountID},
            });
            // When an old temporary-ID route opens after the original replacement has already run
            const {toJSON} = render(
                <DynamicEditAgentPage
                    route={createMock<DynamicEditAgentPageRoute>({params: {accountID: optimisticAccountID}})}
                    navigation={mockNavigation}
                />,
            );
            await act(async () => waitForBatchedUpdates());
            expect(mockSetParams).toHaveBeenCalledWith({accountID: String(realAccountID)});
            // Then the retained mapping resolves the agent without requiring another replacement event
            expect(JSON.stringify(toJSON())).toContain('Already created agent');
            expect(JSON.stringify(toJSON())).toContain('Already created instructions');
            expect(JSON.stringify(toJSON())).not.toContain('notFound.notHere');
        });
    });
});
