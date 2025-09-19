import type {OnyxEntry} from 'react-native-onyx';
import type {LastPaymentMethod, LastPaymentMethodType} from '@src/types/onyx';

/**
 * Selector factory for getting last payment method for a specific policy
 */
const createPolicyLastPaymentMethodSelector =
    (policyID?: string) =>
    (paymentMethods: OnyxEntry<LastPaymentMethod>): LastPaymentMethodType | undefined => {
        return policyID ? (paymentMethods?.[policyID] as LastPaymentMethodType) : undefined;
    };

// eslint-disable-next-line import/prefer-default-export
export {createPolicyLastPaymentMethodSelector};
