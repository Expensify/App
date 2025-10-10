import styles from '@/styles';
import {useState} from 'react';
import {Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import useBiometricsAuthorizationFallback from '@hooks/useBiometricsAuthorizationFallback';
import useLocalize from '@hooks/useLocalize';
import BiometricsInfoModal from '@src/components/BiometricsInfoModal';
import BiometricsInputModal from '@src/components/BiometricsInputModal';
import CONST from '@src/CONST';

type BiometricsAuthenticationFallbackProps = {
    transactionID: string;
};

type AuthorizeWithModal = {
    validateCode?: number;
    otp?: number;
};

function BiometricsAuthenticationFallback({transactionID}: BiometricsAuthenticationFallbackProps) {
    const {translate} = useLocalize();
    const BiometricsSetup = useBiometricsAuthorizationFallback(CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_FALLBACK);
    const [showModal, setShowModal] = useState<boolean>(false);

    const authorizeWithModal = async (props: AuthorizeWithModal = {}) => {
        setShowModal(false);

        await BiometricsSetup.authorize({
            ...props,
            transactionID,
        });

        setShowModal(true);
    };

    return (
        <>
            <TouchableWithoutFeedback onPress={BiometricsSetup.cancel}>
                <View style={[styles.layoutContainer, showModal && (BiometricsSetup.isRequestFulfilled || BiometricsSetup.requiredFactorForNextStep) && styles.layoutContainerWithModal]}>
                    <View style={styles.container}>
                        <View style={styles.content}>
                            <Text style={styles.title}>{translate('biometrics.title', false /* isBiometryConfigured always false in fallback */)}</Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => authorizeWithModal()}
                                >
                                    <Text style={styles.buttonText}>Test</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
            {showModal && BiometricsSetup.isRequestFulfilled && (
                <BiometricsInfoModal
                    message={BiometricsSetup.message}
                    title={BiometricsSetup.title}
                    success={BiometricsSetup.wasRecentStepSuccessful}
                    onClose={() => setShowModal(false)}
                />
            )}
            {BiometricsSetup.requiredFactorForNextStep === CONST.BIOMETRICS.FACTORS.VALIDATE_CODE && (
                <BiometricsInputModal
                    onSubmit={(validateCode) => authorizeWithModal({validateCode})}
                    title={translate('biometrics.provideValidateCode')}
                />
            )}
            {BiometricsSetup.requiredFactorForNextStep === CONST.BIOMETRICS.FACTORS.OTP && (
                <BiometricsInputModal
                    onSubmit={(otp) => authorizeWithModal({otp})}
                    title={translate('biometrics.provideOTPCode')}
                />
            )}
        </>
    );
}

BiometricsAuthenticationFallback.displayName = 'BiometricsAuthenticationFallback';

export default BiometricsAuthenticationFallback;
