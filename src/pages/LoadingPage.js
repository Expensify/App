import PropTypes from 'prop-types';
import React from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';

const propTypes = {
    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func,
    title: PropTypes.string.isRequired,
};

const defaultProps = {
    onBackButtonPress: undefined,
};

function LoadingPage(props) {
    const styles = useThemeStyles();
    return (
        <ScreenWrapper testID={LoadingPage.displayName}>
            <HeaderWithBackButton
                onBackButtonPress={props.onBackButtonPress}
                shouldShowBackButton
                title={props.title}
            />
            <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
        </ScreenWrapper>
    );
}

LoadingPage.displayName = 'LoadingPage';
LoadingPage.propTypes = propTypes;
LoadingPage.defaultProps = defaultProps;

export default LoadingPage;
