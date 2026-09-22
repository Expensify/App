import {render} from '@testing-library/react-native';

import ComposeProviders from '@components/ComposeProviders';
import {LocaleContextProvider} from '@components/LocaleContextProvider';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import ONYXKEYS from '@src/ONYXKEYS';

import type {ValueOf} from 'type-fest';

import {CONST as COMMON_CONST} from 'expensify-common';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

jest.mock('@components/ValidateCodeActionModal/ValidateCodeForm', () => 'ValidateCodeForm');

const defaultProps = {
    title: 'Validate',
    descriptionPrimary: 'Enter the code',
    validateCodeActionErrorField: 'addedLogin',
    handleSubmitForm: () => {},
    clearError: () => {},
};

function renderValidateCodeActionContent(sendValidateCode: jest.Mock, validateCodeReasonCode?: ValueOf<typeof COMMON_CONST.VALIDATE_CODE_REASONS>) {
    return render(
        <ComposeProviders components={[LocaleContextProvider]}>
            <ValidateCodeActionContent
                {...defaultProps}
                sendValidateCode={sendValidateCode}
                validateCodeReasonCode={validateCodeReasonCode}
            />
        </ComposeProviders>,
    );
}

describe('ValidateCodeActionContent', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        return Onyx.clear().then(waitForBatchedUpdates);
    });

    it('sends a code when a recent request was for a different reason', async () => {
        const sendValidateCode = jest.fn();

        await Onyx.merge(ONYXKEYS.VALIDATE_ACTION_CODE, {
            lastValidateCodeRequestedAt: Date.now(),
            lastValidateCodeReason: COMMON_CONST.VALIDATE_CODE_REASONS.VALIDATE_ACCOUNT,
        });
        await waitForBatchedUpdates();

        renderValidateCodeActionContent(sendValidateCode, COMMON_CONST.VALIDATE_CODE_REASONS.ADD_CONTACT_METHOD);
        await waitForBatchedUpdates();

        expect(sendValidateCode).toHaveBeenCalledTimes(1);
    });

    it('does not resend when a recent request was for the same reason', async () => {
        const sendValidateCode = jest.fn();

        await Onyx.merge(ONYXKEYS.VALIDATE_ACTION_CODE, {
            lastValidateCodeRequestedAt: Date.now(),
            lastValidateCodeReason: COMMON_CONST.VALIDATE_CODE_REASONS.ADD_CONTACT_METHOD,
        });
        await waitForBatchedUpdates();

        renderValidateCodeActionContent(sendValidateCode, COMMON_CONST.VALIDATE_CODE_REASONS.ADD_CONTACT_METHOD);
        await waitForBatchedUpdates();

        expect(sendValidateCode).not.toHaveBeenCalled();
    });

    it('sends a code when nothing was requested recently', async () => {
        const sendValidateCode = jest.fn();

        renderValidateCodeActionContent(sendValidateCode, COMMON_CONST.VALIDATE_CODE_REASONS.ADD_CONTACT_METHOD);
        await waitForBatchedUpdates();

        expect(sendValidateCode).toHaveBeenCalledTimes(1);
    });

    it('does not resend when no reason is declared and a code was requested recently', async () => {
        const sendValidateCode = jest.fn();

        await Onyx.merge(ONYXKEYS.VALIDATE_ACTION_CODE, {
            lastValidateCodeRequestedAt: Date.now(),
            lastValidateCodeReason: COMMON_CONST.VALIDATE_CODE_REASONS.VALIDATE_ACCOUNT,
        });
        await waitForBatchedUpdates();

        renderValidateCodeActionContent(sendValidateCode);
        await waitForBatchedUpdates();

        expect(sendValidateCode).not.toHaveBeenCalled();
    });
});
