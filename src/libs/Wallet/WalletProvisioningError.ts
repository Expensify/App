/** Carries only the normalized failure, never encrypted card data or a challenge. */
import type {MultifactorAuthenticationScenarioResponse} from '@components/MultifactorAuthentication/config/types';

class WalletProvisioningError extends Error {
    constructor(readonly response: MultifactorAuthenticationScenarioResponse) {
        super('Digital wallet provisioning failed');
    }
}

export default WalletProvisioningError;
