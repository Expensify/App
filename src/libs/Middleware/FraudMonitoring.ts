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

type FraudSignalFactory = (requestData?: Record<string, unknown>, responseData?: Record<string, unknown>) => FraudSignal;

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
    [WRITE_COMMANDS.ADD_NEW_CONTACT_METHOD]: () => ({event: FRAUD_PROTECTION_EVENT.ADD_SECONDARY_LOGIN}),
    [WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT]: (requestData) =>
        requestData?.isVirtualCard === true ? {event: FRAUD_PROTECTION_EVENT.EDIT_LIMIT_ADMIN_ISSUE_VIRTUAL_CARD} : {event: FRAUD_PROTECTION_EVENT.EDIT_EXPENSIFY_CARD_LIMIT},
    [WRITE_COMMANDS.ADD_PAYMENT_CARD]: () => ({event: FRAUD_PROTECTION_EVENT.ADD_BILLING_CARD}),
    [WRITE_COMMANDS.ADD_PAYMENT_CARD_SCA]: () => ({event: FRAUD_PROTECTION_EVENT.ADD_BILLING_CARD}),
    [SIDE_EFFECT_REQUEST_COMMANDS.REVEAL_EXPENSIFY_CARD_DETAILS]: (_, responseData) => {
        const panAttribute = responseData?.pan ? {key: 'hashed_card_number', value: responseData?.pan as string, shouldHash: true} : undefined;
        return {event: FRAUD_PROTECTION_EVENT.VIEW_VIRTUAL_CARD_PAN, attribute: panAttribute};
    },
    [WRITE_COMMANDS.FINISH_CORPAY_BANK_ACCOUNT_ONBOARDING]: () => ({event: FRAUD_PROTECTION_EVENT.BUSINESS_BANK_ACCOUNT_SETUP}),
    [WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_MANUALLY]: () => ({event: FRAUD_PROTECTION_EVENT.BUSINESS_BANK_ACCOUNT_SETUP}),
    [WRITE_COMMANDS.CONNECT_BANK_ACCOUNT_WITH_PLAID]: () => ({event: FRAUD_PROTECTION_EVENT.BUSINESS_BANK_ACCOUNT_SETUP}),
    [WRITE_COMMANDS.ADD_PERSONAL_BANK_ACCOUNT]: () => ({event: FRAUD_PROTECTION_EVENT.PERSONAL_BANK_ACCOUNT_SETUP}),
    [WRITE_COMMANDS.INVITE_TO_GROUP_CHAT]: (_, responseData) => {
        const newAccountCountAttribute = responseData?.newAccountCount ? {key: 'new_account_count', value: responseData?.newAccountCount as string} : undefined;
        return {event: FRAUD_PROTECTION_EVENT.NEW_EMAILS_INVITED, attribute: newAccountCountAttribute};
    },
    [WRITE_COMMANDS.INVITE_TO_ROOM]: (_, responseData) => {
        const newAccountCountAttribute = responseData?.newAccountCount ? {key: 'new_account_count', value: responseData?.newAccountCount as string} : undefined;
        return {event: FRAUD_PROTECTION_EVENT.NEW_EMAILS_INVITED, attribute: newAccountCountAttribute};
    },
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
        FraudProtection.sendEvent(signal.event);

        if (!signal.attribute) {
            return responseData;
        }

        FraudProtection.setAttribute(signal.attribute.key, signal.attribute.value, signal.attribute.shouldHash);
        return responseData;
    });

export default FraudMonitoring;
