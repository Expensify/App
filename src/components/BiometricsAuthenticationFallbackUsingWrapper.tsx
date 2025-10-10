import BiometricsFallback from '@/src/components/BiometricsFallback';
import styles from '@/styles';
import {Text, TouchableOpacity, TouchableWithoutFeedback, View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

type BiometricsAuthenticationFallbackUsingWrapperProps = {
    transactionID: string;
};

/**
 * Demonstration component showing how to use the BiometricsFallback wrapper pattern
 *
 * This serves as an example of implementing biometric authentication fallback
 * using the BiometricsFallback wrapper component.
 */
function BiometricsAuthenticationFallbackUsingWrapper({transactionID}: BiometricsAuthenticationFallbackUsingWrapperProps) {
    const {translate} = useLocalize();

    /**
     * The wrapper pattern uses BiometricsFallback to manage authentication flow
     * and provides clean separation between authentication logic and UI rendering
     *
     * Scenario is the scenario that we want to perform (in this case, authorize a transaction)
     * Params is the data that we need to pass to the scenario (in this case, the transaction ID)
     */
    return (
        <BiometricsFallback
            scenario={CONST.BIOMETRICS.SCENARIO.AUTHORIZE_TRANSACTION_FALLBACK}
            params={{transactionID}}
        >
            {/**
        Composition Architecture: The wrapper expects exactly two child components
        - Content: Renders main UI and receives secret, authorize function, and status
        - Secret: Conditionally renders content based on authentication state
      */}
            {/**
        Content Component: Renders the main authentication UI
        Receives secret content, authorize function, and authentication status
      */}
            <BiometricsFallback.Content>
                {/**
                 * Content render function receives three parameters from BiometricsFallback wrapper:
                 *
                 * secret: The conditionally rendered content from BiometricsFallback.Secret
                 *         This will be either the authenticated content or fallback content based on auth state
                 *
                 * authorize: Function to trigger the authentication process
                 *            Call this when user wants to authenticate (e.g., button click)
                 *            Can be called with additional parameters for specific auth factors
                 *
                 * status: Object containing current authentication state and progress
                 *         Includes properties like isModalShown, isRequestFulfilled, wasRecentStepSuccessful,
                 *         requiredFactorForNextStep, message, title, cancel function, etc.
                 *
                 * This function should return the main UI that will be displayed to the user,
                 * incorporating the secret content and providing controls to trigger authentication.
                 */}
                {(secret, authorize, status) => (
                    <>
                        {/**
              Authentication Flow: Initially shows fallback UI, user clicks "Test" to authorize,
              on success reveals secret content, handles OTP/validation codes
            */}
                        <TouchableWithoutFeedback onPress={status.cancel}>
                            <View style={[styles.layoutContainer, status.isModalShown && (status.isRequestFulfilled || status.requiredFactorForNextStep) && styles.layoutContainerWithModal]}>
                                <View style={styles.container}>
                                    <View style={styles.content}>
                                        <Text style={styles.title}>{translate('biometrics.title', false /* isBiometryConfigured always false in fallback */)}</Text>
                                        {/** Test button triggers authentication flow */}
                                        <View style={styles.buttonContainer}>
                                            <TouchableOpacity
                                                style={styles.button}
                                                onPress={() => authorize()}
                                            >
                                                <Text style={styles.buttonText}>Test</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                {/** Secret content rendered here - either authenticated or fallback content */}
                                {secret}
                            </View>
                        </TouchableWithoutFeedback>
                    </>
                )}
            </BiometricsFallback.Content>

            {/**
        Security Model: Secret content only renders when:
        - Authentication successful (wasRecentStepSuccessful = true)
        - Request fulfilled (isRequestFulfilled = true)  
        - No modal shown (!isModalShown)

        If all of these conditions are met, the "shouldShowSecret" parameter will be true, otherwise it will be false.
      */}
            <BiometricsFallback.Secret>
                {(shouldShowSecret) => (shouldShowSecret ? <Text style={styles.hugeText}>I am the secret!</Text> : <Text style={styles.hugeText}>Secret is hidden!</Text>)}
            </BiometricsFallback.Secret>
        </BiometricsFallback>
    );
}

BiometricsAuthenticationFallbackUsingWrapper.displayName = 'BiometricsAuthenticationFallbackUsingWrapper';

export default BiometricsAuthenticationFallbackUsingWrapper;
