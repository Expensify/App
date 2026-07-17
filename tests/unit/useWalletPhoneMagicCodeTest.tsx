import {act, renderHook} from '@testing-library/react-native';

import type {UpdatePersonalDetailsForWalletParams} from '@libs/API/parameters';

import useWalletPhoneMagicCode from '@pages/EnablePayments/shared/useWalletPhoneMagicCode';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockUpdatePersonalDetails = jest.fn();
const mockClearWalletAdditionalDetailsErrors = jest.fn();

jest.mock('@userActions/Wallet', () => ({
    updatePersonalDetails: (params: UpdatePersonalDetailsForWalletParams) => {
        mockUpdatePersonalDetails(params);
    },
    clearWalletAdditionalDetailsErrors: () => {
        mockClearWalletAdditionalDetailsErrors();
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
const setErrorCode = (errorCode: string) => Onyx.merge(ONYXKEYS.WALLET_ADDITIONAL_DETAILS, {errorCode});
const setIsLoading = (isLoading: boolean) => Onyx.merge(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS, {isLoading});

describe('useWalletPhoneMagicCode', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        mockUpdatePersonalDetails.mockClear();
        mockClearWalletAdditionalDetailsErrors.mockClear();
    });

    it('submits directly without prompting when the phone number is unchanged (country code normalized)', async () => {
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
        expect(result.current.isMagicCodeRequired).toBe(false);
    });

    it('submits directly without prompting when no phone number is saved yet', async () => {
        const {result} = await renderWalletPhoneMagicCode();

        const params = buildParams();
        act(() => {
            result.current.submitPersonalDetails(params);
        });

        expect(mockUpdatePersonalDetails).toHaveBeenCalledWith(params);
        expect(result.current.isMagicCodeRequired).toBe(false);
    });

    it('prompts for a magic code and holds the submission when an existing phone number is changed', async () => {
        await act(async () => {
            await setStoredPhoneNumber(STORED_PHONE_NUMBER_WITH_COUNTRY_CODE);
            await waitForBatchedUpdates();
        });
        const {result} = await renderWalletPhoneMagicCode();

        act(() => {
            result.current.submitPersonalDetails(buildParams({phoneNumber: CHANGED_PHONE_NUMBER}));
        });

        expect(mockUpdatePersonalDetails).not.toHaveBeenCalled();
        expect(result.current.isMagicCodeRequired).toBe(true);
    });

    it('resubmits with the validate code when the magic code is confirmed', async () => {
        await act(async () => {
            await setStoredPhoneNumber(STORED_PHONE_NUMBER_WITH_COUNTRY_CODE);
            await waitForBatchedUpdates();
        });
        const {result} = await renderWalletPhoneMagicCode();

        const params = buildParams({phoneNumber: CHANGED_PHONE_NUMBER});
        act(() => {
            result.current.submitPersonalDetails(params);
        });
        act(() => {
            result.current.confirmPersonalDetailsWithMagicCode('000000');
        });

        expect(mockUpdatePersonalDetails).toHaveBeenCalledTimes(1);
        expect(mockUpdatePersonalDetails).toHaveBeenCalledWith({...params, validateCode: '000000'});
    });

    it('does nothing when confirming a magic code before any submission', async () => {
        const {result} = await renderWalletPhoneMagicCode();

        act(() => {
            result.current.confirmPersonalDetailsWithMagicCode('000000');
        });

        expect(mockUpdatePersonalDetails).not.toHaveBeenCalled();
    });

    it('requires a magic code purely from an incorrect-magic-code error in Onyx', async () => {
        await act(async () => {
            await setErrorCode(CONST.WALLET.ERROR.INCORRECT_MAGIC_CODE);
            await waitForBatchedUpdates();
        });
        const {result} = await renderWalletPhoneMagicCode();

        expect(result.current.isMagicCodeRequired).toBe(true);
    });

    it('dismisses the prompt once a submission finishes without a magic-code error', async () => {
        await act(async () => {
            await setStoredPhoneNumber(STORED_PHONE_NUMBER_WITH_COUNTRY_CODE);
            await waitForBatchedUpdates();
        });
        const {result} = await renderWalletPhoneMagicCode();

        act(() => {
            result.current.submitPersonalDetails(buildParams({phoneNumber: CHANGED_PHONE_NUMBER}));
        });
        expect(result.current.isMagicCodeRequired).toBe(true);

        await act(async () => {
            await setIsLoading(true);
            await waitForBatchedUpdates();
        });
        await act(async () => {
            await setIsLoading(false);
            await waitForBatchedUpdates();
        });

        expect(result.current.isMagicCodeRequired).toBe(false);
    });

    it('keeps the prompt open when a submission finishes with an incorrect-magic-code error', async () => {
        await act(async () => {
            await setStoredPhoneNumber(STORED_PHONE_NUMBER_WITH_COUNTRY_CODE);
            await waitForBatchedUpdates();
        });
        const {result} = await renderWalletPhoneMagicCode();

        act(() => {
            result.current.submitPersonalDetails(buildParams({phoneNumber: CHANGED_PHONE_NUMBER}));
        });

        await act(async () => {
            await setIsLoading(true);
            await waitForBatchedUpdates();
        });
        await act(async () => {
            await setErrorCode(CONST.WALLET.ERROR.INCORRECT_MAGIC_CODE);
            await setIsLoading(false);
            await waitForBatchedUpdates();
        });

        expect(result.current.isMagicCodeRequired).toBe(true);
    });

    it('clears state and wallet errors when the prompt is closed', async () => {
        await act(async () => {
            await setStoredPhoneNumber(STORED_PHONE_NUMBER_WITH_COUNTRY_CODE);
            await waitForBatchedUpdates();
        });
        const {result} = await renderWalletPhoneMagicCode();

        act(() => {
            result.current.submitPersonalDetails(buildParams({phoneNumber: CHANGED_PHONE_NUMBER}));
        });
        expect(result.current.isMagicCodeRequired).toBe(true);

        act(() => {
            result.current.closeMagicCodePrompt();
        });

        expect(result.current.isMagicCodeRequired).toBe(false);
        expect(mockClearWalletAdditionalDetailsErrors).toHaveBeenCalledTimes(1);
    });
});
