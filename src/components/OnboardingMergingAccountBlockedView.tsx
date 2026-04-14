import React from 'react';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {setOnboardingErrorMessage} from '@userActions/Welcome';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
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
    const illustrations = useMemoizedLazyIllustrations(['ToddBehindCloud']);
    const [onboardingErrorMessage] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY);

    const getErrorSubtitle = () => {
        if (onboardingErrorMessage) {
            return translate(onboardingErrorMessage);
        }
        // Fallback to generic error message
        return translate('onboarding.mergeBlockScreen.subtitle', workEmail);
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
                        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ONBOARDING_ACCOUNTING.path));
                        return;
                    }
                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.ONBOARDING_PURPOSE.path));
                }}
            />
        </>
    );
}

export default OnboardingMergingAccountBlockedView;
