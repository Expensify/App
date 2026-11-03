import {render, screen} from '@testing-library/react-native';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';

import WorkspaceExpensifyCardPage from '@pages/workspace/expensifyCard/WorkspaceExpensifyCardPage';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Card, Policy, WorkspaceCardsList} from '@src/types/onyx';

import type ReactNative from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

import createMock from '../utils/createMock';

const policyID = 'policy123';
const fundID = 200;
const card = createMock<Card>({cardID: 1, accountID: 1, nameValuePairs: {cardTitle: 'Existing card'}});
const props = createMock<PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>>({route: {params: {policyID}}});

let mockPolicy: OnyxEntry<Policy>;
const mockOnyxValues: Record<string, unknown> = {
    [`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${fundID}`]: {hasOnceLoaded: true, paymentBankAccountID: 1},
    [`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${fundID}_Expensify Card`]: createMock<WorkspaceCardsList>({[card.cardID]: card}),
};

jest.mock('@hooks/useDefaultFundID', () => () => 200);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useNetwork', () => () => ({isOffline: true}));
jest.mock('@hooks/useOnyx', () => (key: string) => [mockOnyxValues[key]]);
jest.mock('@hooks/usePolicy', () => () => mockPolicy);
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));
jest.mock('@hooks/useWorkspaceDocumentTitle', () => () => {});
jest.mock('@libs/actions/Card', () => ({updateSelectedExpensifyCardFeed: jest.fn()}));
jest.mock('@userActions/Policy/Policy', () => ({openPolicyExpensifyCardsPage: jest.fn()}));
jest.mock(
    '@pages/workspace/AccessOrNotFoundWrapper',
    () =>
        ({children}: {children: React.ReactNode}) =>
            children,
);
jest.mock('@pages/workspace/expensifyCard/WorkspaceExpensifyCardListPage', () => {
    const {Text} = jest.requireActual<typeof ReactNative>('react-native');
    return ({cardsList}: {cardsList?: WorkspaceCardsList}) => <Text>{`cards: ${Object.keys(cardsList ?? {}).length}`}</Text>;
});

describe('WorkspaceExpensifyCardPage archived workspace', () => {
    beforeEach(() => {
        mockPolicy = createMock<Policy>({id: policyID});
    });

    it('hides cards when the workspace is archived', () => {
        // Given a workspace with an Expensify Card that was archived, possibly while offline, so the card data is unchanged
        mockPolicy = createMock<Policy>({id: policyID, archivedDate: '2026-10-28 20:00:00.000'});

        // When the admin opens the Expensify Card page
        render(<WorkspaceExpensifyCardPage {...props} />);

        // Then no cards are listed because archived workspaces don't show cards
        expect(screen.getByText('cards: 0')).toBeOnTheScreen();
    });

    it('shows cards when the workspace is not archived', () => {
        // Given an active workspace with an Expensify Card

        // When the admin opens the Expensify Card page
        render(<WorkspaceExpensifyCardPage {...props} />);

        // Then the card is listed as before
        expect(screen.getByText('cards: 1')).toBeOnTheScreen();
    });
});
