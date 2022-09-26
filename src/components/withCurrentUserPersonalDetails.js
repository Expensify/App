import React from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import personalDetailsPropType from '../pages/personalDetailsPropType';
import compose from '../libs/compose';
import {withPersonalDetails, withSession} from './OnyxProvider';

const withCurrentUserPersonalDetailsPropTypes = {
    currentUserPersonalDetails: personalDetailsPropType,
};

const withCurrentUserPersonalDetailsDefaultProps = {
    currentUserPersonalDetails: {},
};

export default function (WrappedComponent) {
    const WithCurrentUserPersonalDetails = (props) => {
        const currentUserEmail = props.session.email;

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                currentUserPersonalDetails={props.personalDetails[currentUserEmail]}
            />
        );
    };

    WithCurrentUserPersonalDetails.displayName = `WithCurrentUserPersonalDetails(${getComponentDisplayName(WrappedComponent)})`;
    WithCurrentUserPersonalDetails.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),

        /** Personal details of all the users, including current user */
        personalDetails: PropTypes.objectOf(personalDetailsPropType),

        /** Session of the current user */
        session: PropTypes.shape({
            email: PropTypes.string,
        }),
    };

    WithCurrentUserPersonalDetails.defaultProps = {
        forwardedRef: undefined,
        personalDetails: {},
        session: {
            email: '',
        },
    };

    const withCurrentUserPersonalDetails = React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithCurrentUserPersonalDetails {...props} forwardedRef={ref} />
    ));

    withCurrentUserPersonalDetails.displayName = 'withCurrentUserPersonalDetails';

    return compose(
        withSession(),
        withPersonalDetails(),
    )(withCurrentUserPersonalDetails);
}

export {
    withCurrentUserPersonalDetailsPropTypes,
    withCurrentUserPersonalDetailsDefaultProps,
};
