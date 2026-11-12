import ActivityIndicator from '@components/ActivityIndicator';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

type LoadingPageProps = {
    /** Method to trigger when pressing back button of the header */
    onBackButtonPress?: () => void;

    title: string;
};

function LoadingPage({onBackButtonPress, title}: LoadingPageProps) {
    const styles = useThemeStyles();

    return (
        <ScreenWrapper testID="LoadingPage">
            <HeaderWithBackButtonAndTitle
                onBackButtonPress={onBackButtonPress}
                title={title}
            />
            <View style={[styles.flex1, styles.fullScreenLoading]}>
                <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
            </View>
        </ScreenWrapper>
    );
}

export default LoadingPage;
