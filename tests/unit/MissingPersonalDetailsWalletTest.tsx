/** Verifies wallet collection saves details without shipping or revealing a card. */
import {act, render} from '@testing-library/react-native';

import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import {clearDraftValues} from '@libs/actions/FormActions';
import {setPersonalDetailsAndRevealExpensifyCard, updatePersonalDetailsAndShipExpensifyCards, updatePrivatePersonalDetailsForWallet} from '@libs/actions/PersonalDetails';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MissingPersonalDetailsParamList} from '@libs/Navigation/types';
import {completeWalletEnrollment, isWalletEnrollmentActive} from '@libs/WalletEnrollment';

import MissingPersonalDetailsValidateCodePage from '@pages/MissingPersonalDetails/MissingPersonalDetailsValidateCodePage';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

import {CONST as COMMON_CONST} from 'expensify-common';
import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/ValidateCodeActionModal/ValidateCodeActionContent', () => ({__esModule: true, default: jest.fn(() => null)}));
jest.mock('@hooks/useLocalize', () => ({__esModule: true, default: () => ({translate: (key: string) => key})}));
jest.mock('@hooks/useDynamicBackPath', () => ({__esModule: true, default: () => 'settings/wallet'}));
jest.mock('@hooks/usePrimaryContactMethod', () => ({__esModule: true, default: () => 'test@example.com'}));
jest.mock('@hooks/useNetwork', () => ({__esModule: true, default: () => ({isOffline: false})}));
jest.mock('@hooks/useOnyx', () => ({__esModule: true, default: () => [undefined]}));
jest.mock('@libs/actions/PersonalDetails', () => ({
    clearPersonalDetailsErrors: jest.fn(),
    updatePrivatePersonalDetailsForWallet: jest.fn(),
    setPersonalDetailsAndRevealExpensifyCard: jest.fn(),
    updatePersonalDetailsAndShipExpensifyCards: jest.fn(),
}));
jest.mock('@libs/actions/FormActions', () => ({clearDraftValues: jest.fn()}));
jest.mock('@libs/actions/Card', () => ({clearCardListErrors: jest.fn()}));
jest.mock('@libs/actions/User', () => ({requestValidateCodeAction: jest.fn()}));
jest.mock('@libs/Navigation/Navigation', () => ({__esModule: true, default: {dismissModal: jest.fn(), navigate: jest.fn()}}));
jest.mock('@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute', () => ({__esModule: true, default: (route: string) => route}));
jest.mock('@libs/WalletEnrollment', () => ({completeWalletEnrollment: jest.fn(), isWalletEnrollmentActive: jest.fn()}));

function renderWalletVerification() {
    render(
        <MissingPersonalDetailsValidateCodePage
            {...createMock<PlatformStackScreenProps<MissingPersonalDetailsParamList, typeof SCREENS.DYNAMIC_MISSING_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE>>({
                route: {key: 'verify', name: SCREENS.DYNAMIC_MISSING_PERSONAL_DETAILS_CONFIRM_VALIDATE_CODE, params: {cardID: '123', walletEnrollmentID: 'attempt'}},
            })}
        />,
    );
}

function getVerificationProps() {
    const props = jest.mocked(ValidateCodeActionContent).mock.calls.at(-1)?.[0];
    if (!props) {
        throw new Error('Verification content was not rendered');
    }
    return props;
}

describe('Personal details verification for wallet enrollment', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(isWalletEnrollmentActive).mockReturnValue(true);
        jest.mocked(completeWalletEnrollment).mockReturnValue(true);
    });

    it('waits for the save response and prevents duplicate submissions', async () => {
        // Given an open wallet verification page and a pending save.
        let confirmSave: () => void = () => {};
        jest.mocked(updatePrivatePersonalDetailsForWallet).mockImplementation(
            () =>
                new Promise<void>((resolve) => {
                    confirmSave = resolve;
                }),
        );
        renderWalletVerification();
        expect(getVerificationProps().validateCodeReasonCode).toBe(COMMON_CONST.VALIDATE_CODE_REASONS.UPDATE_PERSONAL_DETAILS);

        // When the user submits twice before the server responds.
        act(() => {
            getVerificationProps().handleSubmitForm('123456');
            getVerificationProps().handleSubmitForm('123456');
        });
        expect(updatePrivatePersonalDetailsForWallet).toHaveBeenCalledTimes(1);
        expect(completeWalletEnrollment).not.toHaveBeenCalled();

        // Then only successful confirmation resumes this attempt, with no shipping or reveal.
        await act(async () => confirmSave());
        expect(completeWalletEnrollment).toHaveBeenCalledWith('attempt', '123', 'verify');
        expect(clearDraftValues).toHaveBeenCalledWith(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
        expect(setPersonalDetailsAndRevealExpensifyCard).not.toHaveBeenCalled();
        expect(updatePersonalDetailsAndShipExpensifyCards).not.toHaveBeenCalled();
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('keeps failed verification open with an error instead of continuing', async () => {
        // Given a rejected save, such as an incorrect verification code.
        jest.mocked(updatePrivatePersonalDetailsForWallet).mockRejectedValue(new Error('Invalid code'));
        renderWalletVerification();

        // When the save fails.
        await act(async () => getVerificationProps().handleSubmitForm('123456'));

        // Then the user sees an error and can retry without starting enrollment.
        expect(completeWalletEnrollment).not.toHaveBeenCalled();
        expect(getVerificationProps().validateError).not.toEqual({});
        expect(getVerificationProps().isLoading).toBe(false);
        expect(clearDraftValues).not.toHaveBeenCalled();
    });

    it('does not save from an inactive attempt and preserves the wallet purpose when editing', () => {
        // Given collection was dismissed or superseded.
        jest.mocked(isWalletEnrollmentActive).mockReturnValue(false);
        renderWalletVerification();

        // When a stale submit fires or the user goes back to edit details.
        getVerificationProps().handleSubmitForm('123456');
        getVerificationProps().onClose?.();

        // Then it cannot save or resume, and internal back navigation retains the same attempt.
        expect(updatePrivatePersonalDetailsForWallet).not.toHaveBeenCalled();
        expect(completeWalletEnrollment).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledWith('missing-personal-details/123?walletEnrollmentID=attempt', {forceReplace: true});
    });
});
