import {fireEvent, render, screen} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import OnyxListItemProvider from '@components/OnyxListItemProvider';

import {setTravelProvisioningFlaggedTravelTypes} from '@libs/actions/Travel';
import type * as TravelActions from '@libs/actions/Travel';

import FlagOffPlatformTravelStep from '@pages/Travel/EnableTravel/subPages/FlagOffPlatformTravelStep';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

const mockOnNext = jest.fn();

jest.mock('@hooks/useLocalize', () => () => ({
    translate: (key: string) => key,
}));

jest.mock('@libs/actions/Travel', () => ({
    ...jest.requireActual<typeof TravelActions>('@libs/actions/Travel'),
    setTravelProvisioningFlaggedTravelTypes: jest.fn(),
}));

const mockSetTravelProvisioningFlaggedTravelTypes = jest.mocked(setTravelProvisioningFlaggedTravelTypes);

const POLICY = createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE);

function renderStep() {
    return render(
        <ComposeProviders components={[OnyxListItemProvider]}>
            <FlagOffPlatformTravelStep
                isEditing={false}
                onNext={mockOnNext}
                onMove={jest.fn()}
                policy={POLICY}
                policyID={POLICY.id}
                resolvedDomain={CONST.TRAVEL.DEFAULT_DOMAIN}
            />
        </ComposeProviders>,
    );
}

describe('FlagOffPlatformTravelStep', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(async () => {
        await Onyx.clear();
        jest.clearAllMocks();
    });

    it('saves the ticked booking types when the admin chooses to flag', async () => {
        // Given the flagging step with no answer yet
        renderStep();
        await waitForBatchedUpdatesWithAct();

        // When Next is pressed before answering
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // Then nothing is saved and the flow waits for an answer
        expect(mockSetTravelProvisioningFlaggedTravelTypes).not.toHaveBeenCalled();
        expect(mockOnNext).not.toHaveBeenCalled();

        // When the admin chooses to flag, clears the hotel box and presses Next
        fireEvent.press(screen.getByText('travel.flagOffPlatformTravel.flag'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('search.filters.travelType.hotel'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // Then the remaining types are saved in the order they're listed and the flow moves on
        expect(mockSetTravelProvisioningFlaggedTravelTypes).toHaveBeenCalledWith([CONST.SEARCH.TRAVEL_TYPE.FLIGHT, CONST.SEARCH.TRAVEL_TYPE.CAR, CONST.SEARCH.TRAVEL_TYPE.TRAIN]);
        expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('saves an empty list when the admin chooses not to flag', async () => {
        // Given the flagging step with no answer yet
        renderStep();
        await waitForBatchedUpdatesWithAct();

        // When the admin picks "Don't flag" and presses Next
        fireEvent.press(screen.getByText('travel.flagOffPlatformTravel.dontFlag'));
        await waitForBatchedUpdatesWithAct();
        fireEvent.press(screen.getByText('common.next'));
        await waitForBatchedUpdatesWithAct();

        // Then an empty list is saved, so terms are accepted without setting up flagging, and the booking types were never shown
        expect(screen.queryByText('travel.flagOffPlatformTravel.selectBookings')).not.toBeOnTheScreen();
        expect(mockSetTravelProvisioningFlaggedTravelTypes).toHaveBeenCalledWith([]);
        expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
});
