import React from 'react';
import {View} from 'react-native';
import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type LoadingPageProps = {
    /** Method to trigger when pressing back button of the header */
    onBackButtonPress?: () => void;

    title: string;
};

function LoadingPage({onBackButtonPress, title}: LoadingPageProps) {
    const styles = useThemeStyles();
    return (
        <ScreenWrapper testID="LoadingPage">
            <HeaderWithBackButton
                onBackButtonPress={onBackButtonPress}
                shouldShowBackButton
                title={title}
            />
            <View style={[styles.flex1, styles.fullScreenLoading]}>
                <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
            </View>
        </ScreenWrapper>
    );
}

export default LoadingPage;
