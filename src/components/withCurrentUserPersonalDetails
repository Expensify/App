import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import ONYXKEYS from '../ONYXKEYS';

const personalDetailsPropTypes = PropTypes.shape({
    // First name of the current user from their personal details
    firstName: PropTypes.string,

    // Last name of the current user from their personal details
    lastName: PropTypes.string,

    // Display name of the current user from their personal details
    displayName: PropTypes.string,

    // Avatar URL of the current user from their personal details
    avatar: PropTypes.string,

    // login of the current user from their personal details
    login: PropTypes.string,

    // pronouns of the current user from their personal details
    pronouns: PropTypes.string,

    // timezone of the current user from their personal details
    timezone: PropTypes.shape({
        selected: PropTypes.string,
    }),
});

export default function (WrappedComponent) {
    const WithPersonalDetails = (props) => {
        const currentUserEmail = props.session.email;

        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                personalDetails={props.personalDetails}
                currentUserPersonalDetails={props.personalDetails[currentUserEmail]}
            />
        );
    };

    WithPersonalDetails.displayName = `WithPersonalDetails(${getComponentDisplayName(WrappedComponent)})`;
    WithPersonalDetails.propTypes = {
        forwardedRef: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
        ]),

        /** Personal details of all the users, including current user */
        personalDetails: PropTypes.objectOf(personalDetailsPropTypes),

        /** Personal details of the current user */
        currentUserPersonalDetails: personalDetailsPropTypes,
        session: PropTypes.shape({
            email: PropTypes.string,
        }),
    };

    WithPersonalDetails.defaultProps = {
        forwardedRef: undefined,
        personalDetails: {},
        currentUserPersonalDetails: {},
        session: {
            email: '',
        },
    };

    const withPersonalDetails = React.forwardRef((props, ref) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WithPersonalDetails {...props} forwardedRef={ref} />
    ));

    return withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(withPersonalDetails);
}

export {
    personalDetailsPropTypes,
};
