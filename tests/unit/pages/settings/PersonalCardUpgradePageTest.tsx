import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@navigation/Navigation';

import PersonalCardUpgradePage from '@pages/settings/Wallet/PersonalCards/upgrade/PersonalCardUpgradePage';

import {createWorkspaceWithPolicyDraft} from '@userActions/App';

import ROUTES from '@src/ROUTES';

import React from 'react';

jest.mock('@userActions/App', () => ({
    createWorkspaceWithPolicyDraft: jest.fn(),
}));

jest.mock('@userActions/Policy/Policy', () => ({
    generateDefaultWorkspaceName: jest.fn(() => 'Test Workspace'),
    generatePolicyID: jest.fn(() => 'test-policy-id'),
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

jest.mock('@hooks/useNetwork', () =>
    jest.fn(() => ({
        isOffline: false,
    })),
);

jest.mock('@hooks/useOnyx', () => jest.fn(() => [undefined, {status: 'loaded'}]));

jest.mock('@hooks/useCurrentUserPersonalDetails', () =>
    jest.fn(() => ({
        accountID: 1,
        email: 'test@example.com',
        localCurrencyCode: 'USD',
    })),
);

jest.mock('@hooks/useActivePolicy', () => jest.fn(() => undefined));
jest.mock('@hooks/useHasActiveAdminPolicies', () => jest.fn(() => false));
jest.mock('@hooks/useLastWorkspaceNumber', () => jest.fn(() => 0));
jest.mock('@hooks/useEnvironment', () =>
    jest.fn(() => ({
        environmentURL: 'https://new.expensify.com',
    })),
);

jest.mock('@hooks/usePreferredCurrency', () => jest.fn(() => 'USD'));
jest.mock('@hooks/useSubscriptionPlan', () => jest.fn(() => undefined));
jest.mock('@hooks/useResponsiveLayout', () => jest.fn(() => ({isExtraSmallScreenWidth: false})));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({Unlock: null})),
    useMemoizedLazyIllustrations: jest.fn(() => ({CompanyCard: null})),
}));

jest.mock('@navigation/Navigation', () => ({
    closeRHPFlow: jest.fn(),
    goBack: jest.fn(),
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => 'settings/wallet/add-personal-card/upgrade'),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@pages/settings/Wallet/PersonalCards/upgrade/UpgradeIntro', () => {
    const {Button} = require('react-native') as typeof import('react-native');
    function MockUpgradeIntro({onUpgrade, buttonDisabled}: {onUpgrade: () => void; buttonDisabled?: boolean}) {
        return (
            <Button
                title="upgrade"
                testID="upgrade-button"
                onPress={onUpgrade}
                disabled={buttonDisabled}
            />
        );
    }
    return MockUpgradeIntro;
});

jest.mock('@pages/settings/Wallet/PersonalCards/upgrade/UpgradeConfirmation', () => {
    const {Button} = require('react-native') as typeof import('react-native');
    function MockUpgradeConfirmation({addPersonalCard, addCompanyCard}: {addPersonalCard: () => void; addCompanyCard: () => void}) {
        return (
            <>
                <Button
                    title="add personal card"
                    testID="confirmation-primary-button"
                    onPress={addPersonalCard}
                />
                <Button
                    title="add company card"
                    testID="confirmation-secondary-button"
                    onPress={addCompanyCard}
                />
            </>
        );
    }
    return MockUpgradeConfirmation;
});

jest.mock('@components/RenderHTML', () => {
    function MockRenderHTML() {
        return null;
    }
    return MockRenderHTML;
});

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeaderWithBackButton() {
        return null;
    }
    return MockHeaderWithBackButton;
});

jest.mock('@components/ScrollView', () => {
    function MockScrollView({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScrollView;
});

describe('PersonalCardUpgradePage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('navigates to add personal card flow with forceReplace after workspace is created', () => {
        render(<PersonalCardUpgradePage />);

        fireEvent.press(screen.getByTestId('upgrade-button'));
        expect(createWorkspaceWithPolicyDraft).toHaveBeenCalledTimes(1);

        fireEvent.press(screen.getByTestId('confirmation-primary-button'));

        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_WALLET_PERSONAL_CARD_ADD_NEW, {forceReplace: true});
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
    });
});
