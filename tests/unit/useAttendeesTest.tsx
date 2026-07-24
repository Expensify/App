import {act, renderHook} from '@testing-library/react-native';

import useAttendees from '@src/hooks/useAttendees';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

describe('useAttendees', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
        return waitForBatchedUpdatesWithAct();
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
            await waitForBatchedUpdatesWithAct();
        });
    });

    it('should return report owner if transaction attendees is empty', async () => {
        const reportID = '1';
        const ownerDetails = {
            accountID: 1,
            login: 'owner@test.com',
            displayName: 'Owner User',
            avatar: 'https://avatar.com',
        };
        const mockTransaction: Transaction = {
            amount: 100,
            created: '2023-01-01',
            currency: 'USD',
            merchant: 'Merchant',
            reportID,
            transactionID: '1',
            comment: {
                attendees: [],
            },
        };

        await act(async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [ownerDetails.accountID]: ownerDetails,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                reportID,
                ownerAccountID: ownerDetails.accountID,
            });
            await waitForBatchedUpdatesWithAct();
        });

        const {result} = renderHook(() => useAttendees(mockTransaction));

        await waitForBatchedUpdatesWithAct();

        expect(result.current).toEqual([
            {
                displayName: ownerDetails.displayName,
                email: ownerDetails.login,
                avatarUrl: ownerDetails.avatar,
            },
        ]);
    });

    it('should return existing attendees if transaction already has attendees', async () => {
        const attendee: Attendee = {
            email: 'attendee@test.com',
            displayName: 'Attendee',
            avatarUrl: '',
        };

        const mockTransaction: Transaction = {
            amount: 100,
            created: '2023-01-01',
            currency: 'USD',
            merchant: 'Merchant',
            reportID: '1',
            transactionID: '1',
            comment: {attendees: [attendee]},
        };

        const {result} = renderHook(() => useAttendees(mockTransaction));
        expect(result.current).toEqual([attendee]);
    });

    it('should handle undefined transaction properly', async () => {
        const {result} = renderHook(() => useAttendees(undefined));
        expect(result.current).toEqual([]);
    });
});
