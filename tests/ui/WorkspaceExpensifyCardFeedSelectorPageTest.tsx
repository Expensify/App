import {render, screen} from '@testing-library/react-native';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import WorkspaceExpensifyCardFeedSelectorPage from '@pages/workspace/expensifyCard/WorkspaceExpensifyCardFeedSelectorPage';

import SCREENS from '@src/SCREENS';

import type ReactNative from 'react-native';

import React from 'react';

import createMock from '../utils/createMock';

const POLICY_ID = 'policy123';

jest.mock('@components/BlockingViews/BlockingView', () => {
    const {Text, View} = jest.requireActual<typeof ReactNative>('react-native');
    return ({title, subtitle}: {title: string; subtitle: string}) => (
        <View>
            <Text>{title}</Text>
            <Text>{subtitle}</Text>
        </View>
    );
});
jest.mock('@components/DelegateNoAccessModalProvider', () => ({
    useDelegateNoAccessActions: () => ({}),
    useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false}),
}));
jest.mock('@components/HeaderWithBackButton', () => () => null);
jest.mock('@components/LockedAccountModalProvider', () => ({
    useLockedAccountActions: () => ({}),
    useLockedAccountState: () => ({isAccountLocked: false}),
}));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock(
    '@components/ScrollView',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@hooks/useCanEnrollNewExpensifyCardProgram', () => ({
    __esModule: true,
    default: () => ({canEnrollNewCardProgram: false}),
}));
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({login: 'member@example.com'}),
}));
jest.mock('@hooks/useDefaultFundID', () => ({
    __esModule: true,
    default: () => 1,
}));
jest.mock('@hooks/useExpensifyCardFeedsForFeedSelector', () => ({
    __esModule: true,
    default: () => ({primaryFeeds: [], otherFeeds: []}),
}));
jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: () => ({Plus: 'Plus'}),
    useMemoizedLazyIllustrations: () => ({
        ExpensifyCardImage: 'ExpensifyCardImage',
        Telescope: 'Telescope',
    }),
}));
jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({translate: (key: string) => key}),
}));
jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: false}),
}));
jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined],
}));
jest.mock('@hooks/usePolicy', () => ({
    __esModule: true,
    default: () => ({id: POLICY_ID}),
}));
jest.mock('@hooks/usePrimaryContactMethod', () => ({
    __esModule: true,
    default: () => 'member@example.com',
}));
jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () => ({flex1: {flex: 1}}),
}));
jest.mock('@libs/PolicyUtils', () => ({
    canEditWorkspaceSettings: () => false,
    canMemberWrite: () => false,
}));
jest.mock('@navigation/Navigation', () => ({
    __esModule: true,
    default: {goBack: jest.fn(), navigate: jest.fn()},
}));
jest.mock('@pages/workspace/AccessOrNotFoundWrapper', () => ({
    __esModule: true,
    default: ({children}: {children: React.ReactNode}) => children,
}));
jest.mock('@selectors/Account', () => ({isUserValidatedSelector: jest.fn()}));
jest.mock('@userActions/CompanyCards', () => ({
    linkCardFeedToPolicy: jest.fn(),
}));

type FeedSelectorScreenProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SELECT_FEED>;
const route: FeedSelectorScreenProps['route'] = {
    key: 'workspace-expensify-card-select-feed',
    name: SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SELECT_FEED,
    params: {policyID: POLICY_ID},
};
const navigation = createMock<FeedSelectorScreenProps['navigation']>({});

describe('WorkspaceExpensifyCardFeedSelectorPage', () => {
    it('shows an empty state when no feeds or actions are available', () => {
        render(
            <WorkspaceExpensifyCardFeedSelectorPage
                route={route}
                navigation={navigation}
            />,
        );

        expect(screen.getByText('workspace.expensifyCard.noCardFeedsAvailable')).toBeOnTheScreen();
        expect(screen.getByText('workspace.expensifyCard.noCardFeedsAvailableDescription')).toBeOnTheScreen();
    });
});
