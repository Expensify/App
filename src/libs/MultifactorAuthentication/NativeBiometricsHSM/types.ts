/**
 * Type definitions specific to native biometrics (HSM).
 */
import type CONST from '@src/CONST';
import type {Base64URLString} from '@src/utils/Base64URL';
import type VALUES from './VALUES';

type NativeBiometricsHSMKeyInfo = {
    rawId: Base64URLString;
    type: typeof VALUES.BIOMETRICS_HSM_TYPE;
    response: {
        clientDataJSON: Base64URLString;
        biometric: {
            publicKey: Base64URLString;
            algorithm: typeof CONST.COSE_ALGORITHM.ES256;
        };
    };
};

export default NativeBiometricsHSMKeyInfo;
