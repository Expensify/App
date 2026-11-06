import {render, screen} from '@testing-library/react-native';

import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import WorkspaceExpensifyCardListPage from '@pages/workspace/expensifyCard/WorkspaceExpensifyCardListPage';

import type SCREENS from '@src/SCREENS';
import type {Card, WorkspaceCardsList} from '@src/types/onyx';
import type CardOnWaitlist from '@src/types/onyx/CardOnWaitlist';

import type ReactNative from 'react-native';

import React from 'react';

import createMock from '../utils/createMock';

const policyID = 'policy123';
const workspaceAccountID = 200;
const domainFundID = 100;
const memberLogin = 'admin@example.com';
const card = createMock<Card>({cardID: 1, accountID: 1, nameValuePairs: {cardTitle: 'Existing card'}});
const cardsList = createMock<WorkspaceCardsList>({[card.cardID]: card});
const route = createMock<PlatformStackRouteProp<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>>({params: {policyID}});

let mockCardOnWaitlist: CardOnWaitlist | undefined;
let mockWorkspaceAccountID: number | undefined = workspaceAccountID;

jest.mock('@components/Button', () => {
    const {Text, View} = jest.requireActual<typeof ReactNative>('react-native');
    function MockButton({children}: {children: React.ReactNode}) {
        return <View>{children}</View>;
    }
    function MockButtonText({children}: {children: React.ReactNode}) {
        return <Text>{children}</Text>;
    }
    MockButton.Icon = () => null;
    MockButton.Text = MockButtonText;
    return {__esModule: true, default: MockButton};
});
jest.mock('@components/ButtonWithDropdownMenu', () => () => null);
jest.mock('@components/DelegateNoAccessModalProvider', () => ({useDelegateNoAccessActions: () => ({}), useDelegateNoAccessState: () => ({isDelegateAccessRestricted: false})}));
jest.mock(
    '@components/HeaderWithBackButton',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/LockedAccountModalProvider', () => ({useLockedAccountActions: () => ({}), useLockedAccountState: () => ({isAccountLocked: false})}));
jest.mock(
    '@components/ScreenWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@components/Tables/WorkspaceExpensifyCardsTable', () => () => null);
jest.mock('@hooks/useAndroidBackButtonHandler', () => () => {});
jest.mock('@hooks/useCleanupSelectedOptions', () => () => {});
jest.mock('@hooks/useConfirmModal', () => ({__esModule: true, default: () => ({showConfirmModal: jest.fn()})}));
jest.mock('@hooks/useCurrencyForExpensifyCard', () => () => 'USD');
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({convertToDisplayString: jest.fn()})}));
jest.mock('@hooks/useEmptyViewHeaderHeight', () => () => 0);
jest.mock('@hooks/useExpensifyCardFeedsForFeedSelector', () => () => ({allFeeds: []}));
jest.mock('@hooks/useLazyAsset', () => ({useMemoizedLazyExpensifyIcons: () => ({Plus: 'Plus'})}));
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key, formatPhoneNumber: (phone: string) => phone}));
jest.mock('@hooks/useMobileSelectionMode', () => () => false);
jest.mock('@hooks/useOnyx', () => (key: string) => [key === `nvp_expensify_onCardWaitlist_${policyID}` ? mockCardOnWaitlist : undefined]);
jest.mock('@hooks/usePersonalDetailByLogin', () => ({usePersonalDetailsByLogins: () => ({[memberLogin]: {accountID: 1, login: memberLogin}})}));
jest.mock('@hooks/usePersonalDetails', () => ({useAllPersonalDetails: () => [{}]}));
jest.mock('@hooks/usePolicy', () => () => ({id: policyID, policyAccountID: mockWorkspaceAccountID, employeeList: {[memberLogin]: {}}}));
jest.mock('@hooks/usePolicyFeatureWriteAccess', () => () => ({canWrite: true}));
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false, isMediumScreenWidth: false, isInLandscapeMode: false}));
jest.mock('@hooks/useShouldDisplayButtonsInSeparateLine', () => () => false);
jest.mock('@hooks/useThemeStyles', () => () => ({}));
jest.mock('@hooks/useWindowDimensions', () => () => ({windowHeight: 800}));

describe('WorkspaceExpensifyCardListPage waitlist', () => {
    beforeEach(() => {
        mockCardOnWaitlist = undefined;
        mockWorkspaceAccountID = workspaceAccountID;
    });

    it('shows Issue card for a provisioned domain feed despite a workspace waitlist', () => {
        // Given a domain feed with cards and an outstanding waitlist request for the workspace feed
        mockCardOnWaitlist = createMock<CardOnWaitlist>({domainName: `expensify-${policyID}.exfy`, bankAccountIsNotOnOtherDomain: false, passedLatestChecks: true});

        // When the admin views the domain feed
        render(
            <WorkspaceExpensifyCardListPage
                route={route}
                cardsList={cardsList}
                fundID={domainFundID}
            />,
        );

        // Then the workspace's pending request must not block issuing cards on the live domain feed
        expect(screen.getByText('workspace.expensifyCard.issueCard')).toBeOnTheScreen();
    });

    it('hides Issue card while the selected workspace feed is on the waitlist', () => {
        // Given the workspace feed has a pending card application and an existing card list
        mockCardOnWaitlist = createMock<CardOnWaitlist>({domainName: `expensify-${policyID}.exfy`, bankAccountIsNotOnOtherDomain: false});

        // When the admin views the workspace feed
        render(
            <WorkspaceExpensifyCardListPage
                route={route}
                cardsList={cardsList}
                fundID={workspaceAccountID}
            />,
        );

        // Then the pending workspace feed keeps its Issue card action hidden
        expect(screen.queryByText('workspace.expensifyCard.issueCard')).not.toBeOnTheScreen();
    });

    it('shows Issue card on a workspace feed that is not on the waitlist', () => {
        // Given a live workspace feed with no pending application

        // When the admin views its cards
        render(
            <WorkspaceExpensifyCardListPage
                route={route}
                cardsList={cardsList}
                fundID={workspaceAccountID}
            />,
        );

        // Then the existing workspace issue flow remains available
        expect(screen.getByText('workspace.expensifyCard.issueCard')).toBeOnTheScreen();
    });

    it('keeps Issue card hidden until the workspace account ID is known', () => {
        // Given a pending card application while the workspace account ID has not loaded yet
        mockCardOnWaitlist = createMock<CardOnWaitlist>({domainName: `expensify-${policyID}.exfy`});
        mockWorkspaceAccountID = undefined;

        // When the card list renders before the policy finishes loading
        render(
            <WorkspaceExpensifyCardListPage
                route={route}
                cardsList={cardsList}
                fundID={domainFundID}
            />,
        );

        // Then the app cannot assume the selected feed is unrelated to the pending application
        expect(screen.queryByText('workspace.expensifyCard.issueCard')).not.toBeOnTheScreen();
    });
});
