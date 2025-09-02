import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import BlockingView from '@components/BlockingViews/BlockingView';
import * as Illustrations from '@components/Icon/Illustrations';
import Button from '@components/Button';
// import useLocalize from '@hooks/useLocalize';

function EnableBiometricsErrorPage() {
    // const translate = useLocalize()
    const styles = useThemeStyles();
    
    return (
        <ScreenWrapper
            testID={EnableBiometricsErrorPage.displayName}
        >
            <HeaderWithBackButton
                // title={}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowBackButton
            />
            <View style={[styles.m5]}>
                <View style={[styles.flex1]}>
                    <BlockingView
                        icon={Illustrations.JustHumptyDumpty}
                        iconWidth={254}
                        iconHeight={165}
                        contentFitImage='fill'
                        title='Oops, something went wrong'
                        subtitle='Your device could not be registered'
                        testID={EnableBiometricsErrorPage.displayName}
                    />
                </View>
                <View style={[styles.flexRow]}>
                    <Button
                        success
                        style={[styles.flex1]}
                        onPress={() => Navigation.goBack()}
                        text="Got it"
                    />
                </View>
            </View>
        </ScreenWrapper>
    );
}

EnableBiometricsErrorPage.displayName = 'EnableBiometricsErrorPage';

export default EnableBiometricsErrorPage;
