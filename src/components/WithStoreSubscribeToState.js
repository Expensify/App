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

            this.subscriptionIDs = [];

            // Initialize the state with each of our property names
            this.state = _.reduce(_.keys(mapStoreToStates), (finalResult, propertyName) => ({
                ...finalResult,
                [propertyName]: null,
            }), {});
        }

        componentDidMount() {
            // Subscribe each of the state properties to the proper store key
            _.each(mapStoreToStates, (mapStoreToState, propertyName) => {
                const {key, path} = mapStoreToState;
                this.bind(key, path, null, propertyName, this.wrappedComponent);
            });

            // Call any loaders that will fill the store with their initial data
            _.each(mapStoreToStates, (mapStoreToState) => {
                if (mapStoreToState.loader) {
                    mapStoreToState.loader(...mapStoreToState.loaderParams || []);
                }
            });
        }

        componentWillUnmount() {
            _.each(this.subscriptionIDs, Store.unbind);
        }

        /**
         * A method that is convenient to bind the state to the store. Typically used when you can't pass
         * mapStoreToStates to this HOC. All subscriptions will automatically be unbound when unmounted
         *
         * @param {string} key
         * @param {string} path
         * @param {string} propertyName
         * @param {object} component
         */
        bind(key, path, defaultValue, propertyName, component) {
            this.subscriptionIDs.push(Store.bind(key, path, defaultValue, propertyName, component));
        }

        render() {
            // Spreading props and state is necessary in an HOC where the data cannot be predicted
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.state}
                    ref={el => this.wrappedComponent = el}
                    bind={this.bind.bind(this)}
                />
            );
        }
    };
}
