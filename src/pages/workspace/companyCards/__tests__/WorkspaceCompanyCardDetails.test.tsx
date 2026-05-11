import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {OnyxProvider} from 'react-native-onyx';
import WorkspaceCompanyCardDetails from '../WorkspaceCompanyCardDetails';
import ONYXKEYS from '@src/ONYXKEYS';
import CONST from '@src/CONST';

const mockPolicy = {
    id: '1',
    name: 'Test Policy',
};

const mockCard = {
    cardID: '123',
    bank: 'testBank',
    accountID: 456,
    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
};

const mockFeed = {
    feeds: {
        testBank: {
            feedName: 'Test Feed',
            domainID: 'testDomain',
        },
    },
};

const mockPersonalDetails = {
    456: {
        displayName: 'John Doe',
        validated: false,
    },
};

const mockRoute = {
    params: {
        cardID: '123',
        policyID: '1',
    },
};

describe('WorkspaceCompanyCardDetails', () => {
    it('should display pending validation message when assigned user is not validated', () => {
        render(
            <OnyxProvider>
                <WorkspaceCompanyCardDetails
                    policy={mockPolicy}
                    route={mockRoute}
                    cardList={{'123': mockCard}}
                    cardFeeds={mockFeed}
                    personalDetails={mockPersonalDetails}
                />
            </OnyxProvider>
        );

        expect(screen.getByText("Card is currently pending and will be issued once John Doe's account is validated.")).toBeTruthy();
    });

    it('should not display pending validation message when assigned user is validated', () => {
        const validatedPersonalDetails = {
            456: {
                displayName: 'John Doe',
                validated: true,
            },
        };

        render(
            <OnyxProvider>
                <WorkspaceCompanyCardDetails
                    policy={mockPolicy}
                    route={mockRoute}
                    cardList={{'123': mockCard}}
                    cardFeeds={mockFeed}
                    personalDetails={validatedPersonalDetails}
                />
            </OnyxProvider>
        );

        expect(screen.queryByText("Card is currently pending and will be issued once John Doe's account is validated.")).toBeNull();
    });

    it('should not display pending validation message when card is not assigned', () => {
        const unassignedCard = {
            ...mockCard,
            accountID: undefined,
        };

        render(
            <OnyxProvider>
                <WorkspaceCompanyCardDetails
                    policy={mockPolicy}
                    route={mockRoute}
                    cardList={{'123': unassignedCard}}
                    cardFeeds={mockFeed}
                    personalDetails={mockPersonalDetails}
                />
            </OnyxProvider>
        );

        expect(screen.queryByText("Card is currently pending and will be issued once John Doe's account is validated.")).toBeNull();
    });
});