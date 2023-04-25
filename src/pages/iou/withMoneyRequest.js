import React, {
    createContext, forwardRef, useEffect, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import getComponentDisplayName from '../../libs/getComponentDisplayName';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../components/withCurrentUserPersonalDetails';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import {withNetwork} from '../../components/OnyxProvider';
import compose from '../../libs/compose';
import optionPropTypes from '../../components/optionPropTypes';
import networkPropTypes from '../../components/networkPropTypes';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

const MoneyRequestContext = createContext();
const moneyRequestPropTypes = {
    // Money request amount
    amount: PropTypes.string.isRequired,

    // Money request currency
    currency: PropTypes.string.isRequired,

    // Selected participants from MoneyRequestParticipantsPage with login
    participants: PropTypes.arrayOf(optionPropTypes),

    // Money request description
    comment: PropTypes.string.isRequired,

    // Callback to update money request amount
    setAmount: PropTypes.func.isRequired,

    // Callback to update money request currency
    setCurrency: PropTypes.func.isRequired,

    // Callback to update money request participants
    setParticipants: PropTypes.func.isRequired,

    // Callback to update money request description
    setComment: PropTypes.func.isRequired,

    // Helper function to prevent user going further steps without completeing the previous steps
    redirectIfEmpty: PropTypes.func.isRequired,
};

/**
 * Redirect to money request initial page if one of the data is empty
 * @param {Array} data
 * @param {String} iouType
 * @param {String} reportID
 */
// eslint-disable-next-line rulesdir/prefer-early-return
const redirectIfEmpty = (data, iouType, reportID) => {
    if (_.some(data, d => _.isEmpty(d))) {
        Navigation.goBack();
        Navigation.navigate(ROUTES.getMoneyRequestRoute(iouType, reportID));
    }
};

const MoneyRequestProvider = (props) => {
    const prevNetworkStatusRef = useRef(props.network.isOffline);
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState(props.currentUserPersonalDetails.localCurrencyCode);
    const [participants, setParticipants] = useState([]);
    const [comment, setComment] = useState('');

    useEffect(() => {
        PersonalDetails.openMoneyRequestModalPage();
    }, []);

    useEffect(() => {
        if (props.network.isOffline || !prevNetworkStatusRef.current) {
            return;
        }

        // User came back online, so let's refetch the currency details based on location
        PersonalDetails.openMoneyRequestModalPage();
    }, [props.network.isOffline]);

    useEffect(() => {
        // Used to store previous prop values to compare on next render
        prevNetworkStatusRef.current = props.network.isOffline;
    });

    const value = {
        amount,
        currency,
        participants,
        comment,
        setAmount,
        setCurrency,
        setParticipants,
        setComment,
        redirectIfEmpty,
    };

    return (
        <MoneyRequestContext.Provider value={value}>
            {props.children}
        </MoneyRequestContext.Provider>
    );
};
MoneyRequestProvider.propTypes = {
    children: PropTypes.node.isRequired,
    network: networkPropTypes.isRequired,
    ...withCurrentUserPersonalDetailsPropTypes,
};
MoneyRequestProvider.defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const MoneyRequestProviderWithOnyx = compose(
    withNetwork(),
    withCurrentUserPersonalDetails,
)(MoneyRequestProvider);

export default function withMoneyRequest(WrappedComponent) {
    const WithMoneyRequest = forwardRef((props, ref) => (
        <MoneyRequestContext.Consumer>
            {moneyRequestProps => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <WrappedComponent {...moneyRequestProps} {...props} ref={ref} />
            )}
        </MoneyRequestContext.Consumer>
    ));

    WithMoneyRequest.displayName = `withMoneyRequest(${getComponentDisplayName(WrappedComponent)})`;
    return WithMoneyRequest;
}

export {
    MoneyRequestProviderWithOnyx as MoneyRequestProvider,
    moneyRequestPropTypes,
};
