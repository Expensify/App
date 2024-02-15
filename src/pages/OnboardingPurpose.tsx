import React, {useCallback} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';

function OnboardingPurpose() {
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const theme = useTheme();

    const closeModal = useCallback(() => {
        Report.dismissEngagementModal();
        Navigation.goBack();
    }, []);

    return (
        <View
            style={[styles.defaultModalContainer, {width: '100%', height: '100%'}]}
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

        </View>
    );
}

OnboardingPurpose.displayName = 'OnboardingPurpose';
export default OnboardingPurpose;
