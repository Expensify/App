import React from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import usePrivatePersonalDetails from '../../hooks/usePrivatePersonalDetails';
import FullscreenLoadingIndicator from '../FullscreenLoadingIndicator';
import ScreenWrapper from '../ScreenWrapper';

const propTypes = {
    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        isLoading: PropTypes.bool,
    }),

    /** Whether to include padding bottom */
    includeSafeAreaPaddingBottom: PropTypes.bool,

    /** Children to wrap in AnimatedStep. */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    privatePersonalDetails: {
        isLoading: true,
    },
    includeSafeAreaPaddingBottom: true,
};

function PersonalDetailsScreenWrapper(props) {
    usePrivatePersonalDetails();

    if (lodashGet(props.privatePersonalDetails, 'isLoading', true)) {
        return <FullscreenLoadingIndicator />;
    }

    return <ScreenWrapper includeSafeAreaPaddingBottom={props.includeSafeAreaPaddingBottom}>{props.children}</ScreenWrapper>;
}

PersonalDetailsScreenWrapper.propTypes = propTypes;
PersonalDetailsScreenWrapper.defaultProps = defaultProps;

export default PersonalDetailsScreenWrapper;
