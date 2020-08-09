/**
 * This is a higher order component that provides the ability to map a state property directly to
 * something in the store. That way, as soon as the store changes, the state will be set and the view
 * will automatically change to reflect the new data.
 */
import React from 'react';
import _ from 'underscore';
import * as Store from '../store/Store';

export default function (mapStoreToStates) {
    return WrappedComponent => class WithStoreSubscribeToState extends React.Component {
        constructor(props) {
            super(props);

            this.subscribedEventGuids = [];

            // Initialize the state with each of our property names
            this.state = _.reduce(_.keys(mapStoreToStates), (finalResult, propertyName) => ({
                ...finalResult,
                [propertyName]: null,
            }), {});
        }

        componentDidMount() {
            this.subscribedEventGuids = _.reduce(mapStoreToStates, (finalResult, mapStoreToState, propertyName) => {
                const {key, path} = mapStoreToState;
                return [
                    ...finalResult,
                    Store.subscribeToState(key, propertyName, path, null, this.wrappedComponent),
                ];
            }, []);

            _.each(mapStoreToStates, (mapStoreToState) => {
                if (mapStoreToState.loader) {
                    mapStoreToState.loader(...mapStoreToState.loaderParams || []);
                }
            });
        }

        componentWillUnmount() {
            _.each(this.subscribedEventGuids, Store.unsubscribeFromState);
        }

        render() {
            // eslint-disable-next-line react/jsx-props-no-spreading
            return <WrappedComponent {...this.props} {...this.state} ref={el => this.wrappedComponent = el} />;
        }
    };
}
