import {WRITE_COMMANDS} from '@libs/API/types';
import FraudProtection from '@libs/FraudProtection';
import CONST, {FRAUD_PROTECTION_EVENT} from '@src/CONST';
import type Middleware from './types';

const apiCommandToFraudEventMap: Record<string, string> = {
    [WRITE_COMMANDS.ENABLE_TWO_FACTOR_AUTH]: FRAUD_PROTECTION_EVENT.TOGGLE_TWO_FACTOR_AUTH,
};

const FraudMonitoring: Middleware = (response, request) =>
    response.then((data) => {
        if (!data || data.jsonCode !== CONST.JSON_CODE.SUCCESS) {
            return data;
        }

        const fraudEvent = apiCommandToFraudEventMap[request.command];
        // If the request is tracked in the Fraud Protection backend, we send the its event
        if (fraudEvent) {
            FraudProtection.sendEvent(fraudEvent);
        }
        return data;
    });

export default FraudMonitoring;
