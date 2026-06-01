import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {createRandomReport} from 'tests/utils/collections/reports';
import createRandomTransaction from 'tests/utils/collections/transaction';
import useReportOwnerAsAttendee from '@hooks/useReportOwnerAsAttendee';
import {getReportOwnerAsAttendee} from '@libs/TransactionUtils';
import ONYXKEYS from '@src/ONYXKEYS';

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
});
