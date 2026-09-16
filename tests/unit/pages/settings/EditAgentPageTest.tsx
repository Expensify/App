import {act, render} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';
import type useStyleUtils from '@hooks/useStyleUtils';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import EditAgentPage from '@pages/settings/Agents/EditAgentPage';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

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

jest.mock('@components/MenuItem', () => {
    function MockMenuItem({title}: {title: string}) {
        return title ?? null;
    }
    return MockMenuItem;
});

jest.mock('@components/MenuItem/presets/MenuItemAction', () => {
    return ({title}: {title: string}) => title ?? null;
});

jest.mock('@components/MenuItemWithTopDescription', () => {
    function MockMenuItemWithTopDescription({title, description}: {title: string; description: string}) {
        return `${description}::${title}`;
    }
    return MockMenuItemWithTopDescription;
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

jest.mock('@components/ReportActionAvatars', () => {
    function MockReportActionAvatars() {
        return null;
    }
    return MockReportActionAvatars;
});

jest.mock('@pages/ErrorPage/NotFoundPage', () => {
    function MockNotFoundPage() {
        return 'notFound.notHere';
    }
    return MockNotFoundPage;
});

const mockUseOnyx = jest.mocked(useOnyx);

const TEST_ACCOUNT_ID = 12345;

type EditAgentPageRoute = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT>['route'];
type EditAgentPageNavigation = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.AGENTS.EDIT>['navigation'];

const mockRoute = createMock<EditAgentPageRoute>({params: {accountID: TEST_ACCOUNT_ID}});
const mockSetParams = jest.fn();
const mockNavigation = createMock<EditAgentPageNavigation>({setParams: mockSetParams});

describe('EditAgentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseOnyx.mockImplementation((key, options) => {
            if (key === ONYXKEYS.PERSONAL_DETAILS_LIST && options?.selector) {
                return [{displayName: 'Default Agent'}, {status: 'loaded'}];
            }
            if (typeof key === 'string' && key.startsWith(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT)) {
                return [{prompt: 'Default prompt'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it('renders agent name from personalDetails', () => {
        mockUseOnyx.mockImplementation((key, options) => {
            if (key === ONYXKEYS.PERSONAL_DETAILS_LIST && options?.selector) {
                return [{displayName: 'Test Agent'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <EditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('Test Agent');
    });

    it('renders prompt from agent Onyx key', () => {
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`) {
                return [{prompt: 'Reject all gambling expenses.'}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <EditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('Reject all gambling expenses.');
    });

    it('renders delete agent menu item', () => {
        const {toJSON} = render(
            <EditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('editAgentPage.deleteAgent');
    });

    it('shows error text when agent has nameErrors', () => {
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`) {
                return [{prompt: 'Some prompt', nameErrors: {someKey: 'agentsPage.error.updateName'}}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <EditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('agentsPage.error.updateName');
    });

    it('shows error text when agent has promptErrors', () => {
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`) {
                return [{prompt: 'Some prompt', promptErrors: {someKey: 'agentsPage.error.updatePrompt'}}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });

        const {toJSON} = render(
            <EditAgentPage
                route={mockRoute}
                navigation={mockNavigation}
            />,
        );

        expect(JSON.stringify(toJSON())).toContain('agentsPage.error.updatePrompt');
    });

    it('renders NotFoundPage when agent and personalDetails are both missing after Onyx is loaded', () => {
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);

        const {toJSON} = render(
            <EditAgentPage
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
            <EditAgentPage
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
            await waitForBatchedUpdates();
            mockUseOnyx.mockImplementation(jest.requireActual<{default: typeof useOnyx}>('@hooks/useOnyx').default);
        });

        it('keeps an already-open Edit page usable when another tab replaces its optimistic agent', async () => {
            const optimisticAccountID = 5728193046572819;
            const realAccountID = 12346;
            const route = createMock<EditAgentPageRoute>({params: {accountID: optimisticAccountID}});
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [optimisticAccountID]: {accountID: optimisticAccountID, displayName: 'Pending agent', isOptimisticPersonalDetail: true},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`, {prompt: 'Pending instructions'});

            const {toJSON} = render(
                <EditAgentPage
                    route={route}
                    navigation={mockNavigation}
                />,
            );
            await act(async () => waitForBatchedUpdates());
            expect(JSON.stringify(toJSON())).toContain('Pending agent');

            // This tab's route has not been redirected. It receives the latest shared state after the tab
            // processing CreateAgent has written the real data and removed the optimistic copies.
            await act(async () => {
                await Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[realAccountID]: {accountID: realAccountID, displayName: 'Created agent'}},
                    [`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`]: {prompt: 'Created instructions'},
                    [`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${optimisticAccountID}`]: null,
                    [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: {[optimisticAccountID]: realAccountID},
                });
                await waitForBatchedUpdates();
            });

            expect(route.params.accountID).toBe(optimisticAccountID);
            expect(mockSetParams).toHaveBeenCalledWith({accountID: realAccountID});
            expect(JSON.stringify(toJSON())).toContain('Created agent');
            expect(JSON.stringify(toJSON())).toContain('Created instructions');
            expect(JSON.stringify(toJSON())).not.toContain('notFound.notHere');

            // Retaining an ID mapping must not hide a genuinely deleted agent or resurrect its old data.
            await act(async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[realAccountID]: null});
                await Onyx.set(`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`, null);
                await waitForBatchedUpdates();
            });
            expect(JSON.stringify(toJSON())).toContain('notFound.notHere');
        });

        it('opens an optimistic route after creation has already completed', async () => {
            const optimisticAccountID = 6849302751684930;
            const realAccountID = 12347;
            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[realAccountID]: {accountID: realAccountID, displayName: 'Already created agent'}},
                [`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${realAccountID}`]: {prompt: 'Already created instructions'},
                [ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING]: {[optimisticAccountID]: realAccountID},
            });
            const {toJSON} = render(
                <EditAgentPage
                    route={createMock<EditAgentPageRoute>({params: {accountID: optimisticAccountID}})}
                    navigation={mockNavigation}
                />,
            );
            await act(async () => waitForBatchedUpdates());
            expect(mockSetParams).toHaveBeenCalledWith({accountID: realAccountID});
            expect(JSON.stringify(toJSON())).toContain('Already created agent');
            expect(JSON.stringify(toJSON())).toContain('Already created instructions');
            expect(JSON.stringify(toJSON())).not.toContain('notFound.notHere');
        });
    });
});
