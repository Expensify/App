import PropTypes from 'prop-types';
import React from 'react';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func,
};

const defaultProps = {
    onBackButtonPress: undefined,
};

// eslint-disable-next-line rulesdir/no-negated-variables
function LoadingPage(props) {
    const styles = useThemeStyles();
    return (
        <ScreenWrapper testID={LoadingPage.displayName}>
            <HeaderWithBackButton
                onBackButtonPress={props.onBackButtonPress}
                shouldShowBackButton
            />
            <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
        </ScreenWrapper>
    );
}

LoadingPage.displayName = 'NotFoundPage';
LoadingPage.propTypes = propTypes;
LoadingPage.defaultProps = defaultProps;

export default LoadingPage;
