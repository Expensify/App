import _ from 'underscore';
import React from 'react';
import {PlaidLink} from 'react-native-plaid-link-sdk';

export default props => (
    <PlaidLink
        tokenConfig={{
            token: props.token,
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {..._.omit(props, 'token')}
        onSuccess={({publicToken, metadata}) => {
            // React Native SDK has a slightly different method signature to the web version so we are destructuring
            // calling onSucess with multiple parameters.
            props.onSuccess(publicToken, metadata);
        }}
    />
);
