/**
 * Type definitions specific to native biometrics (EC256).
 */
import type CONST from '@src/CONST';
import type {Base64URLString} from '@src/utils/Base64URL';
import type VALUES from './VALUES';

type NativeBiometricsEC256KeyInfo = {
    rawId: Base64URLString;
    type: typeof VALUES.EC256_TYPE;
    response: {
        clientDataJSON: Base64URLString;
        biometric: {
            publicKey: Base64URLString;
            algorithm: typeof CONST.COSE_ALGORITHM.ES256;
        };
    };
};

// eslint-disable-next-line import/prefer-default-export
export type {NativeBiometricsEC256KeyInfo};
