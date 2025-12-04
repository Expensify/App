import React from 'react';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {setOnboardingErrorMessage} from '@userActions/Welcome';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import BlockingView from './BlockingViews/BlockingView';
import Button from './Button';

type OnboardingMergingAccountBlockedViewProps = {
    // Work email to display in the subtitle
    workEmail: string | undefined;

    // Whether the user is a VSB
    isVsb: boolean | undefined;
};

function OnboardingMergingAccountBlockedView({workEmail, isVsb}: OnboardingMergingAccountBlockedViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['ToddBehindCloud'] as const);
    const [onboardingErrorMessage] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY, {canBeMissing: true});

    const getErrorSubtitle = () => {
        if (onboardingErrorMessage) {
            return translate(onboardingErrorMessage);
        }
        // Fallback to generic error message
        return translate('onboarding.mergeBlockScreen.subtitle', {workEmail});
    };

    return (
        <>
            <BlockingView
                icon={illustrations.ToddBehindCloud}
                iconWidth={variables.modalTopIconWidth}
                iconHeight={variables.modalTopIconHeight}
                title={translate('onboarding.mergeBlockScreen.title')}
                subtitle={getErrorSubtitle()}
                subtitleStyle={[styles.colorMuted]}
            />
            <Button
                success
                large
                style={[styles.mb5]}
                text={translate('common.buttonConfirm')}
                onPress={() => {
                    setOnboardingErrorMessage(null);
                    if (isVsb) {
                        Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute());
                        return;
                    }
                    Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute());
                }}
            />
        </>
    );
}

OnboardingMergingAccountBlockedView.displayName = 'OnboardingMergingAccountBlockedView';

export default OnboardingMergingAccountBlockedView;
