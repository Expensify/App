import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useHasPhoneNumber from '@hooks/useHasPhoneNumber';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('useHasPhoneNumber', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(() => Onyx.clear());

    it('should return false when user has only email login', async () => {
        await Onyx.merge(ONYXKEYS.LOGIN_LIST, {'user@company.com': {partnerUserID: 'user@company.com'}});
        await Onyx.merge(ONYXKEYS.SESSION, {email: 'user@company.com'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useHasPhoneNumber());

        await waitFor(() => expect(result.current.isLoaded).toBe(true));
        expect(result.current.hasPhoneNumber).toBe(false);
    });

    it('should return true when primary email uses the SMS domain', async () => {
        await Onyx.merge(ONYXKEYS.LOGIN_LIST, {});
        await Onyx.merge(ONYXKEYS.SESSION, {email: `+12345678901${CONST.SMS.DOMAIN}`});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useHasPhoneNumber());

        await waitFor(() => expect(result.current.isLoaded).toBe(true));
        expect(result.current.hasPhoneNumber).toBe(true);
    });

    it('should return true when login list contains an E164 phone number', async () => {
        await Onyx.merge(ONYXKEYS.LOGIN_LIST, {['+12345678901@expensify.sms']: {partnerUserID: '+12345678901@expensify.sms'}});
        await Onyx.merge(ONYXKEYS.SESSION, {email: 'user@company.com'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useHasPhoneNumber());

        await waitFor(() => expect(result.current.isLoaded).toBe(true));
        expect(result.current.hasPhoneNumber).toBe(true);
    });

});
