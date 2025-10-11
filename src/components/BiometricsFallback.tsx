import React, {useState} from 'react';
import useBiometricsAuthorizationFallback from '@hooks/useBiometricsAuthorizationFallback';
import {areBiometricsFallbackParamsValid} from '@hooks/useBiometricsAuthorizationFallback/helpers';
import {UseBiometricsAuthorizationFallback} from '@hooks/useBiometricsAuthorizationFallback/types';
import useLocalize from '@hooks/useLocalize';
import {BiometricsScenarioParameters} from '@libs/Biometrics/scenarios';
import {BiometricsFallbackScenario} from '@libs/Biometrics/scenarios/types';
import BiometricsInfoModal from '@src/components/BiometricsInfoModal';
import BiometricsInputModal from '@src/components/BiometricsInputModal';
import CONST from '@src/CONST';

// Base type for biometrics status including modal state
type BiometricsStatus<T extends BiometricsFallbackScenario> = UseBiometricsAuthorizationFallback<T> & {
    isModalShown: boolean;
};

// Component prop types
type SecretProps = {
    children: (shouldShowSecret: boolean) => React.ReactNode;
};

type ContentProps<T extends BiometricsFallbackScenario> = {
    children: (content: React.ReactNode, authorize: () => Promise<void>, status: BiometricsStatus<T>) => React.ReactNode;
};

// Component type definitions
type SecretComponent = React.ReactElement<SecretProps, typeof BiometricsFallbackSecret>;
type ContentComponent<T extends BiometricsFallbackScenario> = React.ReactElement<ContentProps<T>, typeof BiometricsFallbackContent>;

// Main guard props
type BiometricsGuardProps<T extends BiometricsFallbackScenario> = {
    scenario: T;
    children: [SecretComponent, ContentComponent<T>];
} & (T extends keyof BiometricsScenarioParameters ? {params: BiometricsScenarioParameters[T]} : {params?: undefined});

// Simple content component
function BiometricsFallbackContent<T extends BiometricsFallbackScenario>({children}: ContentProps<T>) {
    return <>{children}</>;
}

// Secret component that receives a function to determine visibility
function BiometricsFallbackSecret({children}: SecretProps) {
    return <>{children}</>;
}

function BiometricsFallback<T extends BiometricsFallbackScenario>({children, scenario, params}: BiometricsGuardProps<T>) {
    const BiometricsFallback = useBiometricsAuthorizationFallback(scenario);
    const [showModal, setShowModal] = useState<boolean>(false);
    const {translate} = useLocalize();

    // Find and validate required child components
    const [secretComponent, contentComponent] = [BiometricsFallbackSecret, BiometricsFallbackContent].map((type) => children.find((child) => child.type === type)) as [
        SecretComponent?,
        ContentComponent<T>?,
    ];

    if (!secretComponent || !contentComponent) {
        throw new Error('BiometricsFallback requires exactly two children: Secret and Content.');
    }

    // Authorization handler
    const handleAuthorize = async (props: Record<string, unknown> = {}) => {
        setShowModal(false);

        if (!areBiometricsFallbackParamsValid(scenario, props)) {
            return;
        }

        await BiometricsFallback.authorize({
            ...props,
            ...params,
        });

        setShowModal(true);
    };

    // Get wrapper render function
    const renderContent = contentComponent.props.children || ((secret) => <>{secret}</>);

    // Handle successful authentication
    const hasAccess = BiometricsFallback.wasRecentStepSuccessful && BiometricsFallback.isRequestFulfilled;
    const shouldShowSecret = hasAccess && !showModal;

    if (shouldShowSecret) {
        return renderContent(<>{secretComponent.props.children(shouldShowSecret)}</>, handleAuthorize, {
            ...BiometricsFallback,
            isModalShown: showModal,
        });
    }

    const renderBiometricsInput = (factor: string, paramName: string) => (
        <BiometricsInputModal
            onSubmit={(value) => handleAuthorize({[paramName]: value})}
            title={translate(`biometrics.provide${factor}`)}
        />
    );

    return (
        <>
            {renderContent(<>{secretComponent.props.children(shouldShowSecret || false)}</>, handleAuthorize, {
                ...BiometricsFallback,
                isModalShown: showModal,
            })}

            {showModal && BiometricsFallback.isRequestFulfilled && (
                <BiometricsInfoModal
                    message={BiometricsFallback.message}
                    title={BiometricsFallback.title}
                    success={BiometricsFallback.wasRecentStepSuccessful}
                    onClose={() => setShowModal(false)}
                />
            )}

            {BiometricsFallback.requiredFactorForNextStep === CONST.BIOMETRICS.FACTORS.VALIDATE_CODE && renderBiometricsInput('ValidateCode', 'validateCode')}

            {BiometricsFallback.requiredFactorForNextStep === CONST.BIOMETRICS.FACTORS.OTP && renderBiometricsInput('OTPCode', 'otp')}
        </>
    );
}

BiometricsFallbackSecret.displayName = 'BiometricsFallbackSecret';
BiometricsFallbackContent.displayName = 'BiometricsFallbackContent';

BiometricsFallback.Secret = BiometricsFallbackSecret;
BiometricsFallback.Content = BiometricsFallbackContent;

export default BiometricsFallback;
