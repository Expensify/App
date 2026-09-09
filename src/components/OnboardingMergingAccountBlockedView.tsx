import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import variables from '@styles/variables';

import {setOnboardingErrorMessage} from '@userActions/Welcome';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import React from 'react';

import BlockingView from './BlockingViews/BlockingView';
import Button from './ButtonComposed';

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
        // This subtitle interpolates the work email, so translate it with the email explicitly.
        if (onboardingErrorMessage === 'onboarding.mergeBlockScreen.domainControlledSubtitle') {
            return translate('onboarding.mergeBlockScreen.domainControlledSubtitle', workEmail);
        }
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
                variant={CONST.BUTTON_VARIANT.SUCCESS}
                size={CONST.BUTTON_SIZE.LARGE}
                style={[styles.mb5]}
                onPress={() => {
                    setOnboardingErrorMessage(null);
                    if (isVsb) {
                        Navigation.navigate(ROUTES.ONBOARDING_EMPLOYEES.getRoute(), {forceReplace: true});
                        return;
                    }
                    Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute());
                }}
            >
                <Button.Text>{translate('common.buttonConfirm')}</Button.Text>
            </Button>
        </>
    );
}

export default OnboardingMergingAccountBlockedView;
