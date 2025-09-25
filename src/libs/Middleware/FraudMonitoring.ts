import {READ_COMMANDS, SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import FraudProtection from '@libs/FraudProtection';
import CONST, {FRAUD_PROTECTION_EVENT} from '@src/CONST';
import type Middleware from './types';

const apiCommandToFraudTagSupplierMap: Record<string, (data?: Record<string, unknown>) => string> = {
    [READ_COMMANDS.SIGN_IN_WITH_SUPPORT_AUTH_TOKEN]: () => FRAUD_PROTECTION_EVENT.START_SUPPORT_SESSION,
    [SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_AS_DELEGATE]: () => FRAUD_PROTECTION_EVENT.START_COPILOT_SESSION,
    [SIDE_EFFECT_REQUEST_COMMANDS.DISCONNECT_AS_DELEGATE]: () => FRAUD_PROTECTION_EVENT.STOP_COPILOT_SESSION,
    [WRITE_COMMANDS.CREATE_EXPENSIFY_CARD]: () => FRAUD_PROTECTION_EVENT.ISSUE_EXPENSIFY_CARD,
    [WRITE_COMMANDS.CREATE_ADMIN_ISSUED_VIRTUAL_CARD]: () => FRAUD_PROTECTION_EVENT.ISSUE_ADMIN_ISSUED_VIRTUAL_CARD,
    [WRITE_COMMANDS.REQUEST_REPLACEMENT_EXPENSIFY_CARD]: () => FRAUD_PROTECTION_EVENT.REQUEST_NEW_PHYSICAL_EXPENSIFY_CARD,
    [WRITE_COMMANDS.REPORT_VIRTUAL_EXPENSIFY_CARD_FRAUD]: () => FRAUD_PROTECTION_EVENT.REQUEST_NEW_VIRTUAL_EXPENSIFY_CARD,
    [WRITE_COMMANDS.MERGE_WITH_VALIDATE_CODE]: () => FRAUD_PROTECTION_EVENT.MERGE_ACCOUNT,
    [WRITE_COMMANDS.ENABLE_TWO_FACTOR_AUTH]: () => FRAUD_PROTECTION_EVENT.TOGGLE_TWO_FACTOR_AUTH,
    [WRITE_COMMANDS.ADD_NEW_CONTACT_METHOD]: () => FRAUD_PROTECTION_EVENT.ADD_SECONDARY_LOGIN,
    [WRITE_COMMANDS.UPDATE_EXPENSIFY_CARD_LIMIT]: (data) =>
        data?.isVirtualCard === true ? FRAUD_PROTECTION_EVENT.EDIT_LIMIT_ADMIN_ISSUE_VIRTUAL_CARD : FRAUD_PROTECTION_EVENT.EDIT_EXPENSIFY_CARD_LIMIT,
};

const FraudMonitoring: Middleware = (response, request) =>
    response.then((data) => {
        if (!data || data.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            return data;
        }

        const fraudTagSupplier = apiCommandToFraudTagSupplierMap[request.command];
        if (!fraudTagSupplier) {
            return data;
        }

        // If the request is tracked in the Fraud Protection backend, we send its event tag
        FraudProtection.sendEvent(fraudTagSupplier(request.data));

        return data;
    });

export default FraudMonitoring;
