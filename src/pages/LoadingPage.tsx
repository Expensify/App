import React from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';

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
            <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
        </ScreenWrapper>
    );
}

export default LoadingPage;
