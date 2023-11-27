import PropTypes from 'prop-types';
import React from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';

const propTypes = {
    /** Method to trigger when pressing back button of the header */
    onBackButtonPress: PropTypes.func,
};

const defaultProps = {
    onBackButtonPress: undefined,
};

// eslint-disable-next-line rulesdir/no-negated-variables
function NotFoundPage({onBackButtonPress}) {
    return (
        <ScreenWrapper testID={NotFoundPage.displayName}>
            <FullPageNotFoundView
                shouldShow
                onBackButtonPress={onBackButtonPress}
            />
        </ScreenWrapper>
    );
}

NotFoundPage.displayName = 'NotFoundPage';
NotFoundPage.propTypes = propTypes;
NotFoundPage.defaultProps = defaultProps;

export default NotFoundPage;
