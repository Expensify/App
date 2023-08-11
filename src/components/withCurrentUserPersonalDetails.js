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
        // eslint-disable-next-line react/forbid-prop-types
        forwardedRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({current: PropTypes.object})]),

        /** Personal details of all the users, including current user */
        personalDetails: PropTypes.objectOf(personalDetailsPropType),

        /** Session of the current user */
        session: PropTypes.shape({
            accountID: PropTypes.number,
        }),
    };
    const defaultProps = {
        forwardedRef: undefined,
        personalDetails: {},
        session: {
            accountID: 0,
        },
    };

    function WithCurrentUserPersonalDetails(props) {
        const accountID = props.session.accountID;
        const currentUserPersonalDetails = useMemo(() => ({...props.personalDetails[accountID], accountID}), [props.personalDetails, accountID]);
        return (
            <WrappedComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                ref={props.forwardedRef}
                currentUserPersonalDetails={currentUserPersonalDetails}
            />
        );
    }

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
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
        },
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(withCurrentUserPersonalDetails);
}

export {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps};
