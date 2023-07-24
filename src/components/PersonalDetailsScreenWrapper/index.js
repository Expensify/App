import React from 'react';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import PropTypes from 'prop-types';
import usePrivatePersonalDetails from '../../hooks/usePrivatePersonalDetails';
import FullscreenLoadingIndicator from '../FullscreenLoadingIndicator';
import ScreenWrapper from '../ScreenWrapper';

const propTypes = {
    /** User's private personal details */
    privatePersonalDetails: PropTypes.shape({
        isLoading: PropTypes.bool,
    }),

    /** Children to wrap in AnimatedStep. */
    children: PropTypes.node.isRequired,
};

const defaultProps = {
    privatePersonalDetails: {
        isLoading: true,
    },
};

function PersonalDetailsScreenWrapper(props) {
    usePrivatePersonalDetails();

    if (lodashGet(props.privatePersonalDetails, 'isLoading', true)) {
        return <FullscreenLoadingIndicator />;
    }

    const screenWrapperProps = _.omit(props, ['privatePersonalDetails', 'children']);

    return (
        <ScreenWrapper
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...screenWrapperProps}
        >
            {props.children}
        </ScreenWrapper>
    );
}

PersonalDetailsScreenWrapper.propTypes = propTypes;
PersonalDetailsScreenWrapper.defaultProps = defaultProps;

export default PersonalDetailsScreenWrapper;
