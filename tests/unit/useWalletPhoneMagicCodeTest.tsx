import {act, renderHook} from '@testing-library/react-native';

import type {UpdatePersonalDetailsForWalletParams} from '@libs/API/parameters';

import useWalletPhoneMagicCode from '@pages/EnablePayments/shared/useWalletPhoneMagicCode';

import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockUpdatePersonalDetails = jest.fn();
const mockNavigate = jest.fn();

jest.mock('@userActions/Wallet', () => ({
    updatePersonalDetails: (params: UpdatePersonalDetailsForWalletParams) => {
        mockUpdatePersonalDetails(params);
    },
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: (route: string) => {
        mockNavigate(route);
    },
}));

// The form stores phone numbers as significant digits, while the saved private details keep the country code. Both
// represent the same US number, so the hook must treat them as unchanged.
const SUBMITTED_PHONE_NUMBER = '2025550123';
const STORED_PHONE_NUMBER_WITH_COUNTRY_CODE = '+12025550123';
const CHANGED_PHONE_NUMBER = '2025559999';

const buildParams = (overrides: Partial<UpdatePersonalDetailsForWalletParams> = {}): UpdatePersonalDetailsForWalletParams => ({
    phoneNumber: SUBMITTED_PHONE_NUMBER,
    legalFirstName: 'Alberta',
    legalLastName: 'Charleson',
    addressStreet: '123 Main St',
    addressCity: 'City',
    addressState: 'CA',
    addressZip: '90001',
    dob: '2000-08-08',
    ssn: '123456789',
    ...overrides,
});

const renderWalletPhoneMagicCode = async () => {
    const hook = renderHook(() => useWalletPhoneMagicCode());
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
};

const setStoredPhoneNumber = (phoneNumber: string) => Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {phoneNumber});

describe('useWalletPhoneMagicCode', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        mockUpdatePersonalDetails.mockClear();
        mockNavigate.mockClear();
    });

    it('submits directly without routing to the magic-code screen when the phone number is unchanged (country code normalized)', async () => {
        await act(async () => {
            await setStoredPhoneNumber(STORED_PHONE_NUMBER_WITH_COUNTRY_CODE);
            await waitForBatchedUpdates();
        });
        const {result} = await renderWalletPhoneMagicCode();

        const params = buildParams();
        act(() => {
            result.current.submitPersonalDetails(params);
        });

        expect(mockUpdatePersonalDetails).toHaveBeenCalledWith(params);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('submits directly without routing to the magic-code screen when no phone number is saved yet', async () => {
        const {result} = await renderWalletPhoneMagicCode();

        const params = buildParams();
        act(() => {
            result.current.submitPersonalDetails(params);
        });

        expect(mockUpdatePersonalDetails).toHaveBeenCalledWith(params);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('routes to the magic-code screen and holds the submission when an existing phone number is changed', async () => {
        await act(async () => {
            await setStoredPhoneNumber(STORED_PHONE_NUMBER_WITH_COUNTRY_CODE);
            await waitForBatchedUpdates();
        });
        const {result} = await renderWalletPhoneMagicCode();

        act(() => {
            result.current.submitPersonalDetails(buildParams({phoneNumber: CHANGED_PHONE_NUMBER}));
        });

        expect(mockUpdatePersonalDetails).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_ENABLE_PAYMENTS_CONFIRM_MAGIC_CODE.getRoute());
    });
});
