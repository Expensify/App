import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import FraudProtection from '@libs/FraudProtection';
import FraudMonitoring from '@libs/Middleware/FraudMonitoring';

import CONST, {FRAUD_PROTECTION_EVENT} from '@src/CONST';
import type Response from '@src/types/onyx/Response';

import type {OnyxKey} from 'react-native-onyx';

jest.mock('@libs/FraudProtection', () => ({
    sendEvent: jest.fn(),
    setAttribute: jest.fn(),
}));

const mockSendEvent = jest.mocked(FraudProtection.sendEvent);
const mockSetAttribute = jest.mocked(FraudProtection.setAttribute);

const EMAIL_LOGIN = 'attacker@example.com';
const MAGIC_CODE = '123456';

function runMiddleware(command: string, data?: Record<string, unknown>, responseData: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.SUCCESS}) {
    return FraudMonitoring(Promise.resolve(responseData), {command, data}, false);
}

function buildEmployees(...roles: string[]) {
    return JSON.stringify(roles.map((role, index) => ({email: `member${index}@example.com`, role})));
}

describe('FraudMonitoring middleware', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        {command: WRITE_COMMANDS.DISABLE_TWO_FACTOR_AUTH, expectedEvent: FRAUD_PROTECTION_EVENT.DISABLE_TWO_FACTOR_AUTH},
        {command: WRITE_COMMANDS.DELETE_CONTACT_METHOD, expectedEvent: FRAUD_PROTECTION_EVENT.REMOVE_SECONDARY_LOGIN},
        {command: WRITE_COMMANDS.REVOKE_DEVICE, expectedEvent: FRAUD_PROTECTION_EVENT.REMOVE_DEVICE},
    ])('sends $expectedEvent when $command succeeds', async ({command, expectedEvent}) => {
        // Given a successful API response for a mapped command
        const responseData: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.SUCCESS};

        // When the FraudMonitoring middleware processes the response
        const result = await FraudMonitoring(Promise.resolve(responseData), {command}, false);

        // Then it sends the expected event, sets no extra attributes, and returns the original response object unchanged
        expect(mockSendEvent).toHaveBeenCalledTimes(1);
        expect(mockSendEvent).toHaveBeenCalledWith(expectedEvent);
        expect(mockSetAttribute).not.toHaveBeenCalled();
        expect(result).toBe(responseData);
    });

    it.each([WRITE_COMMANDS.DISABLE_TWO_FACTOR_AUTH, WRITE_COMMANDS.DELETE_CONTACT_METHOD, WRITE_COMMANDS.REVOKE_DEVICE])('does not send a fraud event when %s fails', async (command) => {
        // Given a non-success API response for a mapped command
        const responseData: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.BAD_REQUEST};

        // When the FraudMonitoring middleware processes the failed response
        const result = await FraudMonitoring(Promise.resolve(responseData), {command}, false);

        // Then no fraud event is sent and the response passes through unchanged
        expect(mockSendEvent).not.toHaveBeenCalled();
        expect(mockSetAttribute).not.toHaveBeenCalled();
        expect(result).toBe(responseData);
    });

    it.each([
        {command: WRITE_COMMANDS.SET_CONTACT_METHOD_AS_DEFAULT, data: {partnerUserID: EMAIL_LOGIN, validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.CHANGE_PRIMARY_LOGIN},
        {command: WRITE_COMMANDS.ADD_NEW_CONTACT_METHOD, data: {partnerUserID: EMAIL_LOGIN, validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.ADD_SECONDARY_LOGIN},
        {command: WRITE_COMMANDS.RESEND_VALIDATE_CODE, data: {reasonCode: 'add_delegate', reasonTargetEmail: EMAIL_LOGIN}, expectedEvent: FRAUD_PROTECTION_EVENT.REQUEST_MAGIC_CODE},
        {command: WRITE_COMMANDS.REQUEST_NEW_VALIDATE_CODE, data: {email: EMAIL_LOGIN, reasonCode: 'sign_in'}, expectedEvent: FRAUD_PROTECTION_EVENT.REQUEST_MAGIC_CODE},
        {command: WRITE_COMMANDS.REQUEST_CONTACT_METHOD_VALIDATE_CODE, data: {email: EMAIL_LOGIN}, expectedEvent: FRAUD_PROTECTION_EVENT.REQUEST_MAGIC_CODE},
        {command: WRITE_COMMANDS.SIGN_IN_USER, data: {email: EMAIL_LOGIN, validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.USE_MAGIC_CODE},
        {command: WRITE_COMMANDS.SIGN_IN_USER_WITH_LINK, data: {accountID: 1, validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.USE_MAGIC_CODE},
        {command: WRITE_COMMANDS.VALIDATE_SECONDARY_LOGIN, data: {partnerUserID: EMAIL_LOGIN, validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.USE_MAGIC_CODE},
        {command: WRITE_COMMANDS.VERIFY_ADD_SECONDARY_LOGIN_CODE, data: {validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.USE_MAGIC_CODE},
        {command: WRITE_COMMANDS.UPDATE_DELEGATE_ROLE, data: {delegateEmail: EMAIL_LOGIN, role: 'all', validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.USE_MAGIC_CODE},
        {command: WRITE_COMMANDS.UPDATE_PRIVATE_PERSONAL_DETAILS, data: {validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.USE_MAGIC_CODE},
        {command: WRITE_COMMANDS.UPDATE_PERSONAL_DETAILS_FOR_WALLET, data: {validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.USE_MAGIC_CODE},
        {command: WRITE_COMMANDS.SET_PERSONAL_DETAILS_AND_SHIP_EXPENSIFY_CARDS, data: {validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.USE_MAGIC_CODE},
        {command: WRITE_COMMANDS.APPROVE_DIGITAL_WALLET_CARD_ADDITION, data: {cardID: 1, validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.USE_MAGIC_CODE},
        {command: WRITE_COMMANDS.REPLACE_TWO_FACTOR_DEVICE, data: {step: 'verify_new', twoFactorAuthCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.REPLACE_TWO_FACTOR_DEVICE},
        {command: WRITE_COMMANDS.ADD_DELEGATE, data: {delegateEmail: EMAIL_LOGIN, role: 'all', validateCode: MAGIC_CODE}, expectedEvent: FRAUD_PROTECTION_EVENT.ADD_DELEGATE},
        {command: WRITE_COMMANDS.REMOVE_DELEGATE, data: {delegateEmail: EMAIL_LOGIN}, expectedEvent: FRAUD_PROTECTION_EVENT.REMOVE_DELEGATE},
        {command: WRITE_COMMANDS.RESOLVE_FRAUD_ALERT, data: {cardID: 1, isFraud: false}, expectedEvent: FRAUD_PROTECTION_EVENT.RESOLVE_FRAUD_ALERT},
        {command: WRITE_COMMANDS.FREEZE_CARD, data: {cardID: 1}, expectedEvent: FRAUD_PROTECTION_EVENT.FREEZE_CARD},
        {command: WRITE_COMMANDS.UNFREEZE_CARD, data: {cardID: 1}, expectedEvent: FRAUD_PROTECTION_EVENT.UNFREEZE_CARD},
        {command: SIDE_EFFECT_REQUEST_COMMANDS.REVEAL_CARD_PIN, data: {cardID: 1}, expectedEvent: FRAUD_PROTECTION_EVENT.REVEAL_CARD_PIN},
        {command: SIDE_EFFECT_REQUEST_COMMANDS.CHANGE_CARD_PIN, data: {cardID: 1}, expectedEvent: FRAUD_PROTECTION_EVENT.CHANGE_CARD_PIN},
        {command: WRITE_COMMANDS.ADD_DOMAIN_MEMBER, data: {email: EMAIL_LOGIN, domainAccountID: 1}, expectedEvent: FRAUD_PROTECTION_EVENT.ADD_DOMAIN_MEMBER},
        {command: WRITE_COMMANDS.ADD_DOMAIN_ADMIN, data: {domainName: 'example.com', targetEmail: EMAIL_LOGIN}, expectedEvent: FRAUD_PROTECTION_EVENT.ADD_DOMAIN_ADMIN},
    ])('sends only $expectedEvent when $command succeeds', async ({command, data, expectedEvent}) => {
        // Given a successful response for a command an attacker could use to take over an account
        // When the middleware processes it
        await runMiddleware(command, data);

        // Then only the event type is sent, because Group-IB doesn't accept the extra attributes for these events yet
        expect(mockSendEvent).toHaveBeenCalledTimes(1);
        expect(mockSendEvent).toHaveBeenCalledWith(expectedEvent);
        expect(mockSetAttribute).not.toHaveBeenCalled();
    });

    it('sends RequestMagicCode for BeginSignIn only when the backend sent a magic code', async () => {
        // Given a BeginSignIn for a SAML account, which signs in without a magic code
        // When the middleware processes it
        await runMiddleware(READ_COMMANDS.BEGIN_SIGNIN, {email: EMAIL_LOGIN}, {jsonCode: CONST.JSON_CODE.SUCCESS, validateCodeSent: false});

        // Then nothing is sent
        expect(mockSendEvent).not.toHaveBeenCalled();

        // When the backend sent a magic code
        await runMiddleware(READ_COMMANDS.BEGIN_SIGNIN, {email: EMAIL_LOGIN}, {jsonCode: CONST.JSON_CODE.SUCCESS, validateCodeSent: true});

        // Then the code request is sent
        expect(mockSendEvent).toHaveBeenCalledTimes(1);
        expect(mockSendEvent).toHaveBeenCalledWith(FRAUD_PROTECTION_EVENT.REQUEST_MAGIC_CODE);
    });

    it('does not send UseMagicCode again on the 2FA step of sign in', async () => {
        // Given the 2FA step of sign in, which sends the magic code from the first step again with the 2FA code
        // When the middleware processes it
        await runMiddleware(WRITE_COMMANDS.SIGN_IN_USER, {email: EMAIL_LOGIN, validateCode: MAGIC_CODE, twoFactorAuthCode: '654321'});

        // Then nothing is sent, because the code use was already sent on the first step
        expect(mockSendEvent).not.toHaveBeenCalled();
    });

    it('does not send UseMagicCode when the command ran without a magic code', async () => {
        // Given an UpdateDelegateRole that didn't need a magic code
        // When the middleware processes it
        await runMiddleware(WRITE_COMMANDS.UPDATE_DELEGATE_ROLE, {delegateEmail: EMAIL_LOGIN, role: 'all'});

        // Then nothing is sent
        expect(mockSendEvent).not.toHaveBeenCalled();
    });

    it('does not send ReplaceTwoFactorDevice when only the old device was verified', async () => {
        // Given the first step of replacing a 2FA device, which doesn't change the device yet
        // When the middleware processes it
        await runMiddleware(WRITE_COMMANDS.REPLACE_TWO_FACTOR_DEVICE, {step: 'verify_old', twoFactorAuthCode: MAGIC_CODE});

        // Then nothing is sent
        expect(mockSendEvent).not.toHaveBeenCalled();
    });

    it('sends AddPolicyMember or AddPolicyAdmin when AddMembersToWorkspace succeeds', async () => {
        // Given workspace members added without an admin
        // When the middleware processes it
        await runMiddleware(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, {policyID: '1', employees: buildEmployees(CONST.POLICY.ROLE.USER, CONST.POLICY.ROLE.AUDITOR)});

        // Then AddPolicyMember is sent
        expect(mockSendEvent).toHaveBeenLastCalledWith(FRAUD_PROTECTION_EVENT.ADD_POLICY_MEMBER);

        // When the same request also adds an admin
        await runMiddleware(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, {policyID: '1', employees: buildEmployees(CONST.POLICY.ROLE.USER, CONST.POLICY.ROLE.ADMIN)});

        // Then AddPolicyAdmin is sent instead, because adding an admin is the riskier action
        expect(mockSendEvent).toHaveBeenLastCalledWith(FRAUD_PROTECTION_EVENT.ADD_POLICY_ADMIN);
        expect(mockSendEvent).toHaveBeenCalledTimes(2);
    });

    it('sends AddPolicyAdmin only when a workspace member is promoted to admin', async () => {
        // Given a role change that doesn't make anyone an admin
        // When the middleware processes it
        await runMiddleware(WRITE_COMMANDS.UPDATE_WORKSPACE_MEMBERS_ROLE, {policyID: '1', employees: buildEmployees(CONST.POLICY.ROLE.AUDITOR)});

        // Then nothing is sent, because it doesn't give more access to the workspace
        expect(mockSendEvent).not.toHaveBeenCalled();

        // When a member is promoted to admin
        await runMiddleware(WRITE_COMMANDS.UPDATE_WORKSPACE_MEMBERS_ROLE, {policyID: '1', employees: buildEmployees(CONST.POLICY.ROLE.ADMIN)});

        // Then AddPolicyAdmin is sent
        expect(mockSendEvent).toHaveBeenCalledTimes(1);
        expect(mockSendEvent).toHaveBeenCalledWith(FRAUD_PROTECTION_EVENT.ADD_POLICY_ADMIN);
    });

    it('sends AddPolicyMember when the employees payload cannot be read', async () => {
        // Given an AddMembersToWorkspace request whose employees aren't valid JSON
        // When the middleware processes it
        const responseData: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.SUCCESS};
        const result = await runMiddleware(WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE, {policyID: '1', employees: 'not json'}, responseData);

        // Then members were still added, so AddPolicyMember is sent and the response passes through unchanged
        expect(mockSendEvent).toHaveBeenCalledWith(FRAUD_PROTECTION_EVENT.ADD_POLICY_MEMBER);
        expect(result).toBe(responseData);
    });

    it.each([
        WRITE_COMMANDS.SET_CONTACT_METHOD_AS_DEFAULT,
        WRITE_COMMANDS.SIGN_IN_USER,
        WRITE_COMMANDS.RESEND_VALIDATE_CODE,
        WRITE_COMMANDS.ADD_DELEGATE,
        WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE,
    ])('does not send a new fraud event when %s fails', async (command) => {
        // Given a failed response, e.g. a wrong magic code
        const responseData: Response<OnyxKey> = {jsonCode: CONST.JSON_CODE.BAD_REQUEST};

        // When the middleware processes it
        const result = await runMiddleware(command, {partnerUserID: EMAIL_LOGIN, validateCode: MAGIC_CODE, employees: buildEmployees(CONST.POLICY.ROLE.ADMIN)}, responseData);

        // Then nothing is sent, because events mean the action succeeded, and the response passes through unchanged
        expect(mockSendEvent).not.toHaveBeenCalled();
        expect(mockSetAttribute).not.toHaveBeenCalled();
        expect(result).toBe(responseData);
    });
});
