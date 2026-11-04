import {act, renderHook} from '@testing-library/react-native';

import useReportOwnerAsAttendee from '@hooks/useReportOwnerAsAttendee';

import {getReportOwnerAsAttendee} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';
import {createRandomReport} from 'tests/utils/collections/reports';
import createRandomTransaction from 'tests/utils/collections/transaction';

describe('useReportOwnerAsAttendee', () => {
    beforeEach(() => {
        return Onyx.clear();
    });

    it('should return report owner as attendee', async () => {
        const id = 1;
        const ownerAccountID = 2;
        const ownerLogin = 'test@gmail.com';
        const ownerAvatar = 'avatar';
        const transaction = createRandomTransaction(id);
        const ownerDetails = {
            login: ownerLogin,
            accountID: ownerAccountID,
            avatar: ownerAvatar,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${id}`, {
            ...createRandomReport(id, undefined),
            ownerAccountID,
        });
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ownerAccountID]: ownerDetails,
        });
        const {result} = renderHook(() => useReportOwnerAsAttendee(transaction));
        expect(result.current).toEqual(getReportOwnerAsAttendee(ownerDetails));
    });

    it('should pick up the owner once the report the expense was moved to lands in Onyx', async () => {
        // Given an expense already pointing at a report that is not in Onyx yet, as right after "Create report" in the
        // report dropdown, which writes the new report ID to the expense without waiting for a screen transition
        const reportID = 3;
        const ownerAccountID = 4;
        const ownerDetails = {
            login: 'owner@gmail.com',
            accountID: ownerAccountID,
            avatar: 'avatar',
        };
        const transaction = createRandomTransaction(reportID);
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ownerAccountID]: ownerDetails,
        });
        const {result} = renderHook(() => useReportOwnerAsAttendee(transaction));
        expect(result.current).toBeUndefined();

        // When the report lands
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                ...createRandomReport(reportID, undefined),
                ownerAccountID,
            });
        });

        // Then the owner shows up as the default attendee without the expense itself changing
        expect(result.current).toEqual(getReportOwnerAsAttendee(ownerDetails));
    });

    it('should fall back to the owner of the report draft when the report itself is not in Onyx', async () => {
        // Given an expense on a report that only exists as a draft so far
        const reportID = 5;
        const ownerAccountID = 6;
        const ownerDetails = {
            login: 'draft-owner@gmail.com',
            accountID: ownerAccountID,
            avatar: 'avatar',
        };
        const transaction = createRandomTransaction(reportID);
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
            [ownerAccountID]: ownerDetails,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${reportID}`, {
            ...createRandomReport(reportID, undefined),
            ownerAccountID,
        });

        // When the hook resolves the default attendee
        const {result} = renderHook(() => useReportOwnerAsAttendee(transaction));

        // Then the draft's owner is used, as the report lookup always fell back to the draft
        expect(result.current).toEqual(getReportOwnerAsAttendee(ownerDetails));
    });
});
