/**
 * This is a higher order component that provides the ability to map a state property directly to
 * something in the store. That way, as soon as the store changes, the state will be set and the view
 * will automatically change to reflect the new data.
 */
import React from 'react';
import _ from 'underscore';
import * as Store from '../store/Store';

export default function (mapStoreToStates) {
    return WrappedComponent => class WithStore extends React.Component {
        constructor(props) {
            super(props);

            this.subscriptionIDs = [];
            this.bind = this.bind.bind(this);
            this.unbind = this.unbind.bind(this);

            // Initialize the state with each of our property names
            this.state = _.reduce(_.keys(mapStoreToStates), (finalResult, propertyName) => ({
                ...finalResult,
                [propertyName]: null,
            }), {});
        }

        componentDidMount() {
            this.bindStoreToStates(mapStoreToStates, this.wrappedComponent);
        }

        componentWillUnmount() {
            this.unbind();
        }

        /**
         * A method that is convenient to bind the state to the store. Typically used when you can't pass
         * mapStoreToStates to this HOC. For example: if the key that you want to subscribe to has a piece of
         * information that can only come from the component's props, then you want to use bind() directly from inside
         * componentDidMount(). All subscriptions will automatically be unbound when unmounted.
         *
         * The options passed to bind are the exact same that you would pass to the HOC.
         *
         * @param {object} mapping
         * @param {object} component
         */
        bind(mapping, component) {
            this.bindStoreToStates(mapping, component);
        }

        bindStoreToStates(statesToStoreMap, component) {
            // Subscribe each of the state properties to the proper store key
            _.each(statesToStoreMap, (stateToStoreMap, propertyName) => {
                const {
                    key,
                    path,
                    prefillWithKey,
                    loader,
                    loaderParams,
                    defaultValue,
                } = stateToStoreMap;

                this.subscriptionIDs.push(Store.bind(key, path, defaultValue, propertyName, component));
                if (prefillWithKey) {
                    Store.get(prefillWithKey, path, defaultValue)
                        .then(data => component.setState({[propertyName]: data}));
                }
                if (loader) {
                    loader(...loaderParams || []);
                }
            });
        }

        /**
         * Unsubscribe from any subscriptions
         */
        unbind() {
            _.each(this.subscriptionIDs, Store.unbind);
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
                    bind={this.bind}
                    unbind={this.unbind}
                />
            );
        }
    };
}
