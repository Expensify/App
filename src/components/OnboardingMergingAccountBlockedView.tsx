import React from 'react';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {setOnboardingErrorMessage} from '@userActions/Welcome';
import ROUTES from '@src/ROUTES';
import BlockingView from './BlockingViews/BlockingView';
import Button from './Button';
import {ToddBehindCloud} from './Icon/Illustrations';

type OnboardingMergingAccountBlockedViewProps = {
    // Work email to display in the subtitle
    workEmail: string | undefined;

    // Whether the user is a VSB
    isVsb: boolean | undefined;
};

function OnboardingMergingAccountBlockedView({workEmail, isVsb}: OnboardingMergingAccountBlockedViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <>
            <BlockingView
                icon={ToddBehindCloud}
                iconWidth={variables.modalTopIconWidth}
                iconHeight={variables.modalTopIconHeight}
                title={translate('onboarding.mergeBlockScreen.title')}
                subtitle={translate('onboarding.mergeBlockScreen.subtitle', {workEmail})}
                subtitleStyle={[styles.colorMuted]}
            />
            <Button
                success
                large
                style={[styles.mb5]}
                text={translate('common.buttonConfirm')}
                onPress={() => {
                    setOnboardingErrorMessage('');
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
