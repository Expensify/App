import React, {useCallback} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import { PressableWithFeedback } from '@components/Pressable';
import ROUTES from '@src/ROUTES';

function OnboardingPersonalDetails() {
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const theme = useTheme();

    const closeModal = useCallback(() => {
        Report.dismissEngagementModal();
        Navigation.goBack();
    }, []);

    return (
        <View
            style={[styles.defaultModalContainer, {width: '100%', height: '100%', backgroundColor: 'blue'}]}
        >
                <View style={{maxHeight: windowHeight}}>
                    <HeaderWithBackButton
                        shouldShowCloseButton
                        shouldShowBackButton={false}
                        onCloseButtonPress={closeModal}
                        shouldOverlay
                        iconFill={theme.iconColorfulBackground}
                    />
                </View>
                <PressableWithFeedback
                style={{marginTop: 100, width: 100, height: 100}}
                accessibilityLabel='TEST'
                accessible
                onPress={() => {
                        Navigation.navigate(ROUTES.ONBOARDING_PURPOSE);
                }}
            >
                <View style={{width: 100, height: 100, backgroundColor: 'red'}} />
            </PressableWithFeedback>
        </View>
    );
}

OnboardingPersonalDetails.displayName = 'OnboardingPersonalDetails';
export default OnboardingPersonalDetails;
