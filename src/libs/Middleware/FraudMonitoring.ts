import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import FraudProtection from '@libs/FraudProtection';

import CONST, {FRAUD_PROTECTION_EVENT} from '@src/CONST';

import type Middleware from './types';

type FraudSignal = {
    event: string;
    attribute?: {
        key: string;
        value: string;
        shouldHash?: boolean;
    };
};

type FraudSignalFactory = (requestData?: Record<string, unknown>, responseData?: Record<string, unknown>) => FraudSignal | undefined;

// Flag commands that create new accounts so the fraud protection backend can detect invite spam.
const createNewAccountCountSignal: FraudSignalFactory = (_, responseData) => {
    const newAccountCount = responseData?.newAccountCount;
    if (typeof newAccountCount !== 'number' || newAccountCount <= 0) {
        return undefined;
    }
    return {event: FRAUD_PROTECTION_EVENT.NEW_EMAILS_INVITED, attribute: {key: 'new_account_count', value: newAccountCount.toString()}};
};

const buildHashedCardNumberAttribute = (responseData: Record<string, unknown> | undefined): FraudSignal['attribute'] => {
    const pan = responseData?.pan;
    return typeof pan === 'string' && pan ? {key: 'hashed_card_number', value: pan, shouldHash: true} : undefined;
};

const revealedCardFraudSignal: FraudSignalFactory = (_, responseData) => ({
    event: FRAUD_PROTECTION_EVENT.VIEW_VIRTUAL_CARD_PAN,
    attribute: buildHashedCardNumberAttribute(responseData),
});

// Some of these commands only take a magic code in some flows, e.g. UpdateDelegateRole after the user has already validated, so the event is only sent when a code was used.
const getMagicCodeUsedSignal: FraudSignalFactory = (requestData) => {
    const validateCode = requestData?.validateCode;
    if (typeof validateCode !== 'string' || !validateCode) {
        return undefined;
    }
    return {event: FRAUD_PROTECTION_EVENT.USE_MAGIC_CODE};
};

// The 2FA step of sign in sends the same magic code again with the 2FA code, so only the first step counts as using it.
const getSignInMagicCodeSignal: FraudSignalFactory = (requestData, responseData) => (requestData?.twoFactorAuthCode ? undefined : getMagicCodeUsedSignal(requestData, responseData));

// BeginSignIn doesn't send a code to SAML accounts, so the backend tells us whether it sent one.
const getBeginSignInSignal: FraudSignalFactory = (_, responseData) => (responseData?.validateCodeSent === true ? {event: FRAUD_PROTECTION_EVENT.REQUEST_MAGIC_CODE} : undefined);

// The first step only checks the old device, the device is replaced once the code from the new one is verified.
const getTwoFactorDeviceReplacedSignal: FraudSignalFactory = (requestData) => (requestData?.step === 'verify_new' ? {event: FRAUD_PROTECTION_EVENT.REPLACE_TWO_FACTOR_DEVICE} : undefined);

const hasPolicyAdmin = (employees: unknown): boolean => {
    if (typeof employees !== 'string') {
        return false;
    }

    // A malformed payload must not throw here, because that would fail the API response this middleware passes on.
    try {
        const parsedEmployees: unknown = JSON.parse(employees);
        return (
            Array.isArray(parsedEmployees) &&
            parsedEmployees.some((employee: unknown) => typeof employee === 'object' && employee !== null && 'role' in employee && employee.role === CONST.POLICY.ROLE.ADMIN)
        );
    } catch {
        return false;
    }
};

// One request can add members and admins together, so it counts as adding an admin when any of them is one, since that's the riskier action.
const getPolicyMembersAddedSignal: FraudSignalFactory = (requestData) => ({
    event: hasPolicyAdmin(requestData?.employees) ? FRAUD_PROTECTION_EVENT.ADD_POLICY_ADMIN : FRAUD_PROTECTION_EVENT.ADD_POLICY_MEMBER,
});

// Only promotions to admin are tracked, other role changes don't give more access to the workspace.
const getPolicyAdminPromotedSignal: FraudSignalFactory = (requestData) => (hasPolicyAdmin(requestData?.employees) ? {event: FRAUD_PROTECTION_EVENT.ADD_POLICY_ADMIN} : undefined);

const fraudSignalFactoryByApiCommand: Record<string, FraudSignalFactory> = {
    [READ_COMMANDS.SIGN_IN_WITH_SUPPORT_AUTH_TOKEN]: () => ({event: FRAUD_PROTECTION_EVENT.START_SUPPORT_SESSION}),
    [SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_AS_DELEGATE]: () => ({event: FRAUD_PROTECTION_EVENT.START_COPILOT_SESSION}),
    [SIDE_EFFECT_REQUEST_COMMANDS.DISCONNECT_AS_DELEGATE]: () => ({event: FRAUD_PROTECTION_EVENT.STOP_COPILOT_SESSION}),
    [WRITE_COMMANDS.CREATE_EXPENSIFY_CARD]: () => ({event: FRAUD_PROTECTION_EVENT.ISSUE_EXPENSIFY_CARD}),
    [WRITE_COMMANDS.CREATE_ADMIN_ISSUED_VIRTUAL_CARD]: () => ({event: FRAUD_PROTECTION_EVENT.ISSUE_ADMIN_ISSUED_VIRTUAL_CARD}),
    [WRITE_COMMANDS.REQUEST_REPLACEMENT_EXPENSIFY_CARD]: () => ({event: FRAUD_PROTECTION_EVENT.REQUEST_NEW_PHYSICAL_EXPENSIFY_CARD}),
    [WRITE_COMMANDS.REPORT_VIRTUAL_EXPENSIFY_CARD_FRAUD]: () => ({event: FRAUD_PROTECTION_EVENT.REQUEST_NEW_VIRTUAL_EXPENSIFY_CARD}),
    [WRITE_COMMANDS.MERGE_WITH_VALIDATE_CODE]: () => ({event: FRAUD_PROTECTION_EVENT.MERGE_ACCOUNT}),
    [WRITE_COMMANDS.ENABLE_TWO_FACTOR_AUTH]: () => ({event: FRAUD_PROTECTION_EVENT.TOGGLE_TWO_FACTOR_AUTH}),
    [WRITE_COMMANDS.DISABLE_TWO_FACTOR_AUTH]: () => ({event: FRAUD_PROTECTION_EVENT.DISABLE_TWO_FACTOR_AUTH}),
    [WRITE_COMMANDS.REPLACE_TWO_FACTOR_DEVICE]: getTwoFactorDeviceReplacedSignal,
    [WRITE_COMMANDS.ADD_NEW_CONTACT_METHOD]: () => ({event: FRAUD_PROTECTION_EVENT.ADD_SECONDARY_LOGIN}),
    [WRITE_COMMANDS.DELETE_CONTACT_METHOD]: () => ({event: FRAUD_PROTECTION_EVENT.REMOVE_SECONDARY_LOGIN}),
    [WRITE_COMMANDS.REVOKE_DEVICE]: () => ({event: FRAUD_PROTECTION_EVENT.REMOVE_DEVICE}),
    [WRITE_COMMANDS.SET_CONTACT_METHOD_AS_DEFAULT]: () => ({event: FRAUD_PROTECTION_EVENT.CHANGE_PRIMARY_LOGIN}),
    [READ_COMMANDS.BEGIN_SIGNIN]: getBeginSignInSignal,
    [WRITE_COMMANDS.REQUEST_NEW_VALIDATE_CODE]: () => ({event: FRAUD_PROTECTION_EVENT.REQUEST_MAGIC_CODE}),
    [WRITE_COMMANDS.RESEND_VALIDATE_CODE]: () => ({event: FRAUD_PROTECTION_EVENT.REQUEST_MAGIC_CODE}),
    [WRITE_COMMANDS.REQUEST_CONTACT_METHOD_VALIDATE_CODE]: () => ({event: FRAUD_PROTECTION_EVENT.REQUEST_MAGIC_CODE}),
    [WRITE_COMMANDS.SIGN_IN_USER]: getSignInMagicCodeSignal,
    [WRITE_COMMANDS.SIGN_IN_USER_WITH_LINK]: getSignInMagicCodeSignal,
    [WRITE_COMMANDS.VALIDATE_SECONDARY_LOGIN]: getMagicCodeUsedSignal,
    [WRITE_COMMANDS.VERIFY_ADD_SECONDARY_LOGIN_CODE]: getMagicCodeUsedSignal,
    [WRITE_COMMANDS.UPDATE_DELEGATE_ROLE]: getMagicCodeUsedSignal,
    [WRITE_COMMANDS.UPDATE_PRIVATE_PERSONAL_DETAILS]: getMagicCodeUsedSignal,
    [WRITE_COMMANDS.UPDATE_PERSONAL_DETAILS_FOR_WALLET]: getMagicCodeUsedSignal,
    [WRITE_COMMANDS.SET_PERSONAL_DETAILS_AND_SHIP_EXPENSIFY_CARDS]: getMagicCodeUsedSignal,
    [WRITE_COMMANDS.APPROVE_DIGITAL_WALLET_CARD_ADDITION]: getMagicCodeUsedSignal,
    [WRITE_COMMANDS.ADD_DELEGATE]: () => ({event: FRAUD_PROTECTION_EVENT.ADD_DELEGATE}),
    [WRITE_COMMANDS.REMOVE_DELEGATE]: () => ({event: FRAUD_PROTECTION_EVENT.REMOVE_DELEGATE}),
    [WRITE_COMMANDS.RESOLVE_FRAUD_ALERT]: () => ({event: FRAUD_PROTECTION_EVENT.RESOLVE_FRAUD_ALERT}),
    [WRITE_COMMANDS.FREEZE_CARD]: () => ({event: FRAUD_PROTECTION_EVENT.FREEZE_CARD}),
    [WRITE_COMMANDS.UNFREEZE_CARD]: () => ({event: FRAUD_PROTECTION_EVENT.UNFREEZE_CARD}),
    [SIDE_EFFECT_REQUEST_COMMANDS.REVEAL_CARD_PIN]: () => ({event: FRAUD_PROTECTION_EVENT.REVEAL_CARD_PIN}),
    [SIDE_EFFECT_REQUEST_COMMANDS.CHANGE_CARD_PIN]: () => ({event: FRAUD_PROTECTION_EVENT.CHANGE_CARD_PIN}),
    [WRITE_COMMANDS.ADD_MEMBERS_TO_WORKSPACE]: getPolicyMembersAddedSignal,
    [WRITE_COMMANDS.UPDATE_WORKSPACE_MEMBERS_ROLE]: getPolicyAdminPromotedSignal,
    [WRITE_COMMANDS.ADD_DOMAIN_MEMBER]: () => ({event: FRAUD_PROTECTION_EVENT.ADD_DOMAIN_MEMBER}),
    [WRITE_COMMANDS.ADD_DOMAIN_ADMIN]: () => ({event: FRAUD_PROTECTION_EVENT.ADD_DOMAIN_ADMIN}),
    [WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT]: (requestData) =>
        requestData?.isVirtualCard === true ? {event: FRAUD_PROTECTION_EVENT.EDIT_LIMIT_ADMIN_ISSUE_VIRTUAL_CARD} : {event: FRAUD_PROTECTION_EVENT.EDIT_EXPENSIFY_CARD_LIMIT},
    [WRITE_COMMANDS.ADD_PAYMENT_CARD]: () => ({event: FRAUD_PROTECTION_EVENT.ADD_BILLING_CARD}),
    [WRITE_COMMANDS.ADD_PAYMENT_CARD_SCA]: () => ({event: FRAUD_PROTECTION_EVENT.ADD_BILLING_CARD}),
    [SIDE_EFFECT_REQUEST_COMMANDS.REVEAL_EXPENSIFY_TRAVEL_CARD_DETAILS]: revealedCardFraudSignal,
    [SIDE_EFFECT_REQUEST_COMMANDS.SET_PERSONAL_DETAILS_AND_REVEAL_EXPENSIFY_CARD]: revealedCardFraudSignal,
    [WRITE_COMMANDS.FINISH_CORPAY_BANK_ACCOUNT_ONBOARDING]: () => ({event: FRAUD_PROTECTION_EVENT.BUSINESS_BANK_ACCOUNT_SETUP}),
    [WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_MANUALLY]: () => ({event: FRAUD_PROTECTION_EVENT.BUSINESS_BANK_ACCOUNT_SETUP}),
    [WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID]: () => ({event: FRAUD_PROTECTION_EVENT.BUSINESS_BANK_ACCOUNT_SETUP}),
    [WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT]: () => ({event: FRAUD_PROTECTION_EVENT.PERSONAL_BANK_ACCOUNT_SETUP}),
    [WRITE_COMMANDS.INVITE_TO_GROUP_CHAT]: createNewAccountCountSignal,
    [WRITE_COMMANDS.INVITE_TO_ROOM]: createNewAccountCountSignal,
    [WRITE_COMMANDS.SEND_MONEY_ELSEWHERE]: createNewAccountCountSignal,
    [WRITE_COMMANDS.SEND_MONEY_WITH_WALLET]: createNewAccountCountSignal,
    [WRITE_COMMANDS.OPEN_REPORT]: createNewAccountCountSignal,
};

const FraudMonitoring: Middleware = (response, request) =>
    response.then((responseData) => {
        if (!responseData || responseData.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            return responseData;
        }

        const createFraudSignal = fraudSignalFactoryByApiCommand[request.command];
        if (!createFraudSignal) {
            return responseData;
        }

        const signal = createFraudSignal(request.data, responseData);
        if (!signal) {
            return responseData;
        }

        FraudProtection.sendEvent(signal.event);

        if (!signal.attribute) {
            return responseData;
        }

        FraudProtection.setAttribute(signal.attribute.key, signal.attribute.value, signal.attribute.shouldHash);
        return responseData;
    });

export default FraudMonitoring;
