/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import getComponentDisplayName from '../libs/getComponentDisplayName';

// This HOC will subscribe a component to the internal Onyx key related to an action's loading state and the action itself
export default function withActions(actionMap) {
    const onyxMap = _.reduce(
        actionMap,
        (subscriptionMap, action) => ({...subscriptionMap, [`internalWithActions_${action.name}`]: {key: action.onyxKey, initWithStoredValues: false}}),
        {},
    );
    return (WrappedComponent) => {
        const WithActions = (props) => {
            const onyxInternalKeys = _.keys(onyxMap);
            const passProps = _.reduce(
                actionMap,
                (finalProps, action, propName) => {
                    const actionMetaData = props[`internalWithActions_${action.name}`] || {loading: false, error: ''};
                    const actionProp = {
                        run: action.run,
                        ...actionMetaData,
                    };
                    return {...finalProps, [propName]: actionProp};
                },
                {},
            );
            return (
                <WrappedComponent
                    {..._.omit(props, onyxInternalKeys)}
                    {...passProps}
                    ref={props.forwardedRef}
                />
            );
        };

        WithActions.displayName = `withActions(${getComponentDisplayName(WrappedComponent)})`;
        WithActions.propTypes = {
            forwardedRef: PropTypes.oneOfType([
                PropTypes.func,
                PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
            ]),
        };
        WithActions.defaultProps = {
            forwardedRef: undefined,
        };
        const WithActionsRef = React.forwardRef((props, ref) => (
            // eslint-disable-next-line react/jsx-props-no-spreading
            <WithActions {...props} forwardedRef={ref} />
        ));

        return withOnyx(onyxMap)(WithActionsRef);
    };
}
