import styles from '@/styles';
import {useState} from 'react';
import {Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import BiometricsInfoModal from '@src/components/BiometricsInfoModal';
import BiometricsInputModal from '@src/components/BiometricsInputModal';
import CONST from '@src/CONST';
import useBiometricsSetup from '../hooks/useBiometricsSetup';

function BiometricsAuthenticationSetup() {
    const {translate} = useLocalize();
    const BiometricsSetup = useBiometricsSetup();
    const [showModal, setShowModal] = useState<boolean>(false);

    const authorizeWithModal = async (validateCode?: number) => {
        setShowModal(false);

        await BiometricsSetup.register({
            validateCode,
        });

        setShowModal(true);
    };

    return (
        <>
            <TouchableWithoutFeedback onPress={BiometricsSetup.cancel}>
                <View style={[styles.layoutContainer, showModal && (BiometricsSetup.isRequestFulfilled || BiometricsSetup.requiredFactorForNextStep) && styles.layoutContainerWithModal]}>
                    <View style={styles.container}>
                        <View style={styles.content}>
                            <Text style={styles.title}>{translate('biometrics.title', BiometricsSetup.isBiometryConfigured)}</Text>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={() => authorizeWithModal()}
                                >
                                    <Text style={styles.buttonText}>Test</Text>
                                </TouchableOpacity>

                                {BiometricsSetup.isBiometryConfigured && (
                                    <TouchableOpacity
                                        style={styles.buttonNegativeSmall}
                                        onPress={() => BiometricsSetup.revoke()}
                                    >
                                        <Text style={styles.buttonTextNegative}>Remove</Text>
                                    </TouchableOpacity>
                                )}
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
                    onSubmit={(validateCode) => authorizeWithModal(validateCode)}
                    title={translate('biometrics.provideValidateCode')}
                />
            )}
        </>
    );
}

BiometricsAuthenticationSetup.displayName = 'BiometricsAuthenticationSetup';

export default BiometricsAuthenticationSetup;
