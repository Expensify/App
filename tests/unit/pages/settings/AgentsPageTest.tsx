import {render} from '@testing-library/react-native';
import React from 'react';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import AgentsPage from '@pages/settings/Agents/AgentsPage';
import {openAgentsPage} from '@userActions/Agent';
import ONYXKEYS from '@src/ONYXKEYS';

jest.mock('@userActions/Agent', () => ({
    openAgentsPage: jest.fn(),
}));

jest.mock('@hooks/usePermissions', () => jest.fn(() => ({isBetaEnabled: () => true})));

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

jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({shouldUseNarrowLayout: false})));

jest.mock('@hooks/useDocumentTitle', () => jest.fn());

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: jest.fn(() => ({TvScreenRobot: 1, AiBot: 1})),
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Plus: 1})),
}));

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

jest.mock('@components/OnyxListItemProvider', () => ({
    usePersonalDetails: jest.fn(() => ({})),
    useSession: jest.fn(() => ({})),
    usePolicyCategories: jest.fn(() => ({})),
    usePolicyTags: jest.fn(() => ({})),
    useAllReportsTransactionsAndViolations: jest.fn(() => ({})),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    goBack: jest.fn(),
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

jest.mock('@components/EmptyStateComponent/GenericEmptyStateComponent', () => {
    function MockEmptyState({title}: {title: string}) {
        return title;
    }
    return MockEmptyState;
});

jest.mock('@components/SelectionList', () => {
    function MockSelectionList({data}: {data: Array<{text: string}>}) {
        return (data ?? []).map((item) => item.text).join(',');
    }
    return MockSelectionList;
});

jest.mock('@components/SelectionList/ListItem/UserListItem', () => 'UserListItem');

jest.mock('@pages/ErrorPage/NotFoundPage', () => {
    function MockNotFoundPage() {
        return 'NotFoundPage';
    }
    return MockNotFoundPage;
});

const mockUsePermissions = jest.mocked(usePermissions);
const mockOpenAgentsPage = jest.mocked(openAgentsPage);
const mockUseOnyx = jest.mocked(useOnyx);
const mockUsePersonalDetails = jest.mocked(usePersonalDetails);

describe('AgentsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePermissions.mockReturnValue({isBetaEnabled: () => true});
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);
        mockUsePersonalDetails.mockReturnValue({});
    });

    it('renders page content when customAgent beta is enabled', () => {
        const {toJSON} = render(<AgentsPage />);
        const output = JSON.stringify(toJSON());

        expect(output).not.toContain('NotFoundPage');
        expect(output).toContain('agentsPage.title');
    });

    it('renders NotFoundPage when customAgent beta is disabled', () => {
        mockUsePermissions.mockReturnValue({isBetaEnabled: () => false});

        const {toJSON} = render(<AgentsPage />);

        expect(JSON.stringify(toJSON())).toContain('NotFoundPage');
    });

    it('calls openAgentsPage on mount', () => {
        render(<AgentsPage />);

        expect(mockOpenAgentsPage).toHaveBeenCalledTimes(1);
    });

    it('does not call openAgentsPage when beta is disabled', () => {
        mockUsePermissions.mockReturnValue({isBetaEnabled: () => false});

        render(<AgentsPage />);

        expect(mockOpenAgentsPage).not.toHaveBeenCalled();
    });

    it('shows empty state when no agents exist', () => {
        mockUseOnyx.mockReturnValue([undefined, {status: 'loaded'}]);

        const {toJSON} = render(<AgentsPage />);

        expect(JSON.stringify(toJSON())).toContain('agentsPage.emptyAgents.title');
    });

    it('shows agent list when agents exist in Onyx', () => {
        const TEST_ACCOUNT_ID = 12345;
        mockUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT) {
                return [{[`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`]: {prompt: 'Test prompt'}}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
        mockUsePersonalDetails.mockReturnValue({
            [TEST_ACCOUNT_ID]: {
                accountID: TEST_ACCOUNT_ID,
                displayName: 'Test Agent',
                login: 'agent@example.com',
                avatar: undefined,
            },
        });

        const {toJSON} = render(<AgentsPage />);
        const output = JSON.stringify(toJSON());

        expect(output).toContain('Test Agent');
        expect(output).not.toContain('agentsPage.emptyAgents.title');
    });

    it('excludes agents whose personal details are missing from the list', () => {
        const TEST_ACCOUNT_ID = 12345;
        mockUseOnyx.mockImplementation((key) => {
            if (key === ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT) {
                return [{[`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${TEST_ACCOUNT_ID}`]: {prompt: 'Test prompt'}}, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
        // personalDetailsList has no entry for TEST_ACCOUNT_ID
        mockUsePersonalDetails.mockReturnValue({});

        const {toJSON} = render(<AgentsPage />);

        expect(JSON.stringify(toJSON())).toContain('agentsPage.emptyAgents.title');
    });
});
