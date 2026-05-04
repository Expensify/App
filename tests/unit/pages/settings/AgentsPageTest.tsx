import {render} from '@testing-library/react-native';
import React from 'react';
import usePermissions from '@hooks/usePermissions';
import AgentsPage from '@pages/settings/Agents/AgentsPage';
import {openAgentsPage} from '@userActions/Agent';

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

jest.mock('@pages/ErrorPage/NotFoundPage', () => {
    function MockNotFoundPage() {
        return 'NotFoundPage';
    }
    return MockNotFoundPage;
});

const mockUsePermissions = jest.mocked(usePermissions);
const mockOpenAgentsPage = jest.mocked(openAgentsPage);

describe('AgentsPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUsePermissions.mockReturnValue({isBetaEnabled: () => true});
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
});
