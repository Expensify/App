import {renderHook, waitFor} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useHasPhoneNumberLogin from '@hooks/useHasPhoneNumberLogin';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

describe('useHasPhoneNumberLogin', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(() => Onyx.clear());

    it('should return false when user has only email login', async () => {
        const emailLogin = 'user@company.com';
        await Onyx.merge(ONYXKEYS.LOGIN_LIST, {[emailLogin]: {partnerUserID: emailLogin}});
        await Onyx.merge(ONYXKEYS.SESSION, {email: emailLogin});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useHasPhoneNumberLogin());

        await waitFor(() => expect(result.current.isPhoneNumberLoaded).toBe(true));
        expect(result.current.hasPhoneNumberLogin).toBe(false);
    });

    it('should return true when primary email uses the SMS domain', async () => {
        await Onyx.merge(ONYXKEYS.LOGIN_LIST, {});
        await Onyx.merge(ONYXKEYS.SESSION, {email: `+12345678901${CONST.SMS.DOMAIN}`});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useHasPhoneNumberLogin());

        await waitFor(() => expect(result.current.isPhoneNumberLoaded).toBe(true));
        expect(result.current.hasPhoneNumberLogin).toBe(true);
    });

    it('should return true when login list contains an E164 phone number', async () => {
        const smsLogin = '+12345678901@expensify.sms';
        await Onyx.merge(ONYXKEYS.LOGIN_LIST, {[smsLogin]: {partnerUserID: smsLogin}});
        await Onyx.merge(ONYXKEYS.SESSION, {email: 'user@company.com'});
        await waitForBatchedUpdates();

        const {result} = renderHook(() => useHasPhoneNumberLogin());

        await waitFor(() => expect(result.current.isPhoneNumberLoaded).toBe(true));
        expect(result.current.hasPhoneNumberLogin).toBe(true);
    });
});
