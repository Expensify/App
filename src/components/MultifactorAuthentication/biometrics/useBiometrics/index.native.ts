import useNativeBiometrics from '@components/MultifactorAuthentication/biometrics/useNativeBiometrics';
import useNativeBiometricsEC256 from '@components/MultifactorAuthentication/biometrics/useNativeBiometricsEC256';
import CONST from '@src/CONST';

export default CONST.MULTIFACTOR_AUTHENTICATION.USE_NATIVE_EC256 ? useNativeBiometricsEC256 : useNativeBiometrics;
