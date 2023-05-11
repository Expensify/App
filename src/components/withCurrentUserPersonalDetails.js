import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import ONYXKEYS from '../ONYXKEYS';
import personalDetailsPropType from '../pages/personalDetailsPropType';

const withCurrentUserPersonalDetailsPropTypes = {
    currentUserPersonalDetails: personalDetailsPropType,
};

const withCurrentUserPersonalDetailsDefaultProps = {
    currentUserPersonalDetails: {},
};

export default function (WrappedComponent) {
    const propTypes = {
        forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.instanceOf(React.Component)})]),

        /** Personal details of all the users, including current user */
        personalDetails: PropTypes.objectOf(personalDetailsPropType),

        /** Session of the current user */
        session: PropTypes.shape({
            email: PropTypes.string,
            accountID: PropTypes.number,
        }),
    };
    const defaultProps = {
        forwardedRef: undefined,
        personalDetails: {},
        session: {
            email: '',
            accountID: 0,
        },
    };

    const WithCurrentUserPersonalDetails = (props) => {
        const currentUserEmail = props.session.email;
        const accountID = props.session.accountID;
        const currentUserPersonalDetails = useMemo(() => ({...props.personalDetails[currentUserEmail], accountID}), [props.personalDetails, currentUserEmail, accountID]);
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                currentUserPersonalDetails={currentUserPersonalDetails}
            />
        );
    };

    WithCurrentUserPersonalDetails.displayName = `WithCurrentUserPersonalDetails(${getComponentDisplayName(WrappedComponent)})`;
    WithCurrentUserPersonalDetails.propTypes = propTypes;

    WithCurrentUserPersonalDetails.defaultProps = defaultProps;

    const withCurrentUserPersonalDetails = React.forwardRef((props, ref) => (
        <WithCurrentUserPersonalDetails
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            forwardedRef={ref}
        />
    ));

    return withOnyx({
        personalDetails: {
            key: ONYXKEYS.PERSONAL_DETAILS,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(withCurrentUserPersonalDetails);
}

export {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps};
