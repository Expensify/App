import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import ONYXKEYS from '../ONYXKEYS';
import personalDetailsPropType from '../pages/personalDetailsPropType';
import refPropTypes from './refPropTypes';
import {usePersonalDetails} from './OnyxProvider';
import CONST from '../CONST';

const withCurrentUserPersonalDetailsPropTypes = {
    currentUserPersonalDetails: personalDetailsPropType,
};

const withCurrentUserPersonalDetailsDefaultProps = {
    currentUserPersonalDetails: {},
};

export default function (WrappedComponent) {
    const propTypes = {
        forwardedRef: refPropTypes,

        /** Session of the current user */
        session: PropTypes.shape({
            accountID: PropTypes.number,
        }),
    };
    const defaultProps = {
        forwardedRef: undefined,
        session: {
            accountID: 0,
        },
    };

    function WithCurrentUserPersonalDetails(props) {
        const personalDetails = usePersonalDetails() || CONST.EMPTY_OBJECT;
        const accountID = props.session.accountID;
        const accountPersonalDetails = personalDetails[accountID];
        const currentUserPersonalDetails = useMemo(() => ({...accountPersonalDetails, accountID}), [accountPersonalDetails, accountID]);
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
        session: {
            key: ONYXKEYS.SESSION,
        },
    })(withCurrentUserPersonalDetails);
}

export {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps};
