import {act, renderHook} from '@testing-library/react-native';

import type {UpdatePersonalDetailsForWalletParams} from '@libs/API/parameters';

import useWalletPhoneValidateCode from '@pages/EnablePayments/shared/useWalletPhoneValidateCode';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

import Onyx from 'react-native-onyx';

import getOnyxValue from '../utils/getOnyxValue';
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

const renderWalletPhoneValidateCode = async () => {
    const hook = renderHook(() => useWalletPhoneValidateCode());
    await act(async () => {
        await waitForBatchedUpdates();
    });
    return hook;
};

const setStoredPhoneNumber = (phoneNumber: string) => Onyx.merge(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {phoneNumber});

describe('useWalletPhoneValidateCode', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.clear();
        await waitForBatchedUpdates();
        mockUpdatePersonalDetails.mockClear();
        mockNavigate.mockClear();
    });

    it('submits directly without routing to the validateCode screen when the phone number is unchanged (country code normalized)', async () => {
        await act(async () => {
            await setStoredPhoneNumber(STORED_PHONE_NUMBER_WITH_COUNTRY_CODE);
            await waitForBatchedUpdates();
        });
        const {result} = await renderWalletPhoneValidateCode();

        const params = buildParams();
        act(() => {
            result.current.submitPersonalDetails(params);
        });

        expect(mockUpdatePersonalDetails).toHaveBeenCalledWith(params);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('routes to the validateCode screen when a phone number is set for the first time (none saved yet)', async () => {
        const {result} = await renderWalletPhoneValidateCode();

        act(() => {
            result.current.submitPersonalDetails(buildParams());
        });

        expect(mockUpdatePersonalDetails).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_ENABLE_PAYMENTS_CONFIRM_VALIDATE_CODE.getRoute());
    });

    it('routes to the validateCode screen and holds the submission when an existing phone number is changed', async () => {
        await act(async () => {
            await setStoredPhoneNumber(STORED_PHONE_NUMBER_WITH_COUNTRY_CODE);
            await waitForBatchedUpdates();
        });
        const {result} = await renderWalletPhoneValidateCode();

        act(() => {
            result.current.submitPersonalDetails(buildParams({phoneNumber: CHANGED_PHONE_NUMBER}));
        });

        expect(mockUpdatePersonalDetails).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SETTINGS_ENABLE_PAYMENTS_CONFIRM_VALIDATE_CODE.getRoute());
    });

    it('saves every submitted detail to the form draft before routing to the validateCode screen', async () => {
        // Given a stored phone number and a form draft that only holds the field the user edited, since pre-filled
        // values (e.g. the legal name) are never drafted
        await act(async () => {
            await setStoredPhoneNumber(STORED_PHONE_NUMBER_WITH_COUNTRY_CODE);
            await Onyx.set(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT, {phoneNumber: CHANGED_PHONE_NUMBER});
            await waitForBatchedUpdates();
        });
        const {result} = await renderWalletPhoneValidateCode();

        // When the phone number is changed, which holds the submission until the validateCode is entered
        await act(async () => {
            result.current.submitPersonalDetails(buildParams({phoneNumber: CHANGED_PHONE_NUMBER}));
            await waitForBatchedUpdates();
        });

        // Then the draft holds every submitted detail, so the validateCode screen sends the complete request
        const draft = await getOnyxValue(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS_DRAFT);
        expect(draft).toEqual({
            legalFirstName: 'Alberta',
            legalLastName: 'Charleson',
            addressStreet: '123 Main St',
            addressCity: 'City',
            addressState: 'CA',
            addressZipCode: '90001',
            dob: '2000-08-08',
            ssn: '123456789',
            phoneNumber: CHANGED_PHONE_NUMBER,
        });
        expect(mockUpdatePersonalDetails).not.toHaveBeenCalled();
    });

    it('routes to the validateCode screen of the calling flow when it provides its own route', async () => {
        // Given the IOU pay flow, which must open the validateCode screen on top of itself rather than the Settings wallet one
        const payFlowRoute: Route = ROUTES.ENABLE_PAYMENTS;
        const {result} = renderHook(() => useWalletPhoneValidateCode(() => payFlowRoute));
        await act(async () => {
            await waitForBatchedUpdates();
        });

        // When a phone number is set
        act(() => {
            result.current.submitPersonalDetails(buildParams());
        });

        // Then the submission is held and the user is sent to the flow's own validateCode route
        expect(mockUpdatePersonalDetails).not.toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith(payFlowRoute);
    });

    it('submits directly without routing to the validateCode screen when no phone number is provided', async () => {
        const {result} = await renderWalletPhoneValidateCode();

        const params = buildParams({phoneNumber: ''});
        act(() => {
            result.current.submitPersonalDetails(params);
        });

        expect(mockUpdatePersonalDetails).toHaveBeenCalledWith(params);
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
