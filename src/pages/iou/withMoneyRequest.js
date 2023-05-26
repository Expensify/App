import React, {createContext, forwardRef, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../../libs/getComponentDisplayName';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../components/withCurrentUserPersonalDetails';
import * as PersonalDetails from '../../libs/actions/PersonalDetails';
import optionPropTypes from '../../components/optionPropTypes';
import useOnNetworkReconnect from '../../components/hooks/useOnNetworkReconnect';

const MoneyRequestContext = createContext();
const moneyRequestPropTypes = PropTypes.shape({
    // Money request amount
    amount: PropTypes.number.isRequired,

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
});

const MoneyRequestProvider = (props) => {
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState(props.currentUserPersonalDetails.localCurrencyCode);
    const [participants, setParticipants] = useState([]);
    const [comment, setComment] = useState('');

    const value = {
        moneyRequest: {
            amount,
            currency,
            participants,
            comment,
            setAmount,
            setCurrency,
            setParticipants,
            setComment,
        },
    };

    return <MoneyRequestContext.Provider value={value}>{props.children}</MoneyRequestContext.Provider>;
};
MoneyRequestProvider.propTypes = {
    children: PropTypes.node.isRequired,
    ...withCurrentUserPersonalDetailsPropTypes,
};
MoneyRequestProvider.defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const MoneyRequestProviderWithOnyx = withCurrentUserPersonalDetails(MoneyRequestProvider);

export default function withMoneyRequest(WrappedComponent) {
    const WithMoneyRequest = forwardRef((props, ref) => (
        <MoneyRequestContext.Consumer>
            {(moneyRequestProps) => (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...moneyRequestProps}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...props}
                    ref={ref}
                />
            )}
        </MoneyRequestContext.Consumer>
    ));

    WithMoneyRequest.displayName = `withMoneyRequest(${getComponentDisplayName(WrappedComponent)})`;
    return WithMoneyRequest;
}

export {MoneyRequestProviderWithOnyx as MoneyRequestProvider, moneyRequestPropTypes};
