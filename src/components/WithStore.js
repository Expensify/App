/**
 * This is a higher order component that provides the ability to map a state property directly to
 * something in the store. That way, as soon as the store changes, the state will be set and the view
 * will automatically change to reflect the new data.
 */
import React from 'react';
import _ from 'underscore';
import get from 'lodash.get';
import has from 'lodash.has';
import * as Store from '../store/Store';

export default function (mapStoreToStates) {
    return WrappedComponent => class WithStore extends React.Component {
        constructor(props) {
            super(props);

            this.subscriptionIDs = {};
            this.subscriptionIDsWithPropsData = {};

            // Initialize the state with each of our property names
            this.state = _.reduce(_.keys(mapStoreToStates), (finalResult, propertyName) => ({
                ...finalResult,
                [propertyName]: null,
            }), {});
        }

        componentDidMount() {
            this.bindStoreToStates(mapStoreToStates, this.wrappedComponent);
        }

        componentDidUpdate(prevProps) {
            // If we are mapping to things use data from the props, then when the props change, all the subscriptions
            // need to be rebound
            _.each(mapStoreToStates, (mapStoreToState, propertyName) => {
                if (has(mapStoreToState, 'pathForProps')) {
                    const prevPropsData = get(prevProps, mapStoreToState.pathForProps);
                    const currentPropsData = get(this.props, mapStoreToState.pathForProps);
                    if (prevPropsData !== currentPropsData) {
                        Store.unbind(this.subscriptionIDsWithPropsData[mapStoreToState.pathForProps]);
                        this.bindSingleMappingToStore(mapStoreToState, propertyName, this.wrappedComponent);
                    }
                }
            });
        }

        componentWillUnmount() {
            this.unbind();
        }

        /**
         * Takes a single mapping, either passed from creating the wrapped component, or bound from directly calling
         * bind() and maps each state property to the store
         *
         * @param {object} statesToStoreMap
         * @param {object} component
         */
        bindStoreToStates(statesToStoreMap, component) {
            // Subscribe each of the state properties to the proper store key
            _.each(statesToStoreMap, (stateToStoreMap, propertyName) => {
                this.bindSingleMappingToStore(stateToStoreMap, propertyName, component);
            });
        }

        bindSingleMappingToStore(mapping, propertyName, component) {
            const {
                key,
                path,
                prefillWithKey,
                loader,
                loaderParams,
                defaultValue,
                pathForProps,
            } = mapping;

            // If there is a path for props data, then the data needs to be pulled out of props and parsed
            // into the key
            if (pathForProps) {
                const dataFromProps = get(this.props, pathForProps);
                const keyWithPropsData = key.replace('%DATAFROMPROPS%', dataFromProps);
                const subscriptionID = Store.bind(keyWithPropsData, path, defaultValue, propertyName, component);

                // Store it with a key that is unique to the data we're getting from the props
                this.subscriptionIDsWithPropsData[pathForProps] = subscriptionID;
            } else {
                const subscriptionID = Store.bind(key, path, defaultValue, propertyName, component);
                this.subscriptionIDs[subscriptionID] = subscriptionID;
            }

            // Prefill the state with any data already in the store
            if (prefillWithKey) {
                let prefillKey = prefillWithKey;

                // If there is a path for props data, then the data needs to be pulled out of props and parsed
                // into the key
                if (pathForProps) {
                    const dataFromProps = get(this.props, pathForProps);
                    prefillKey = prefillWithKey.replace('%DATAFROMPROPS%', dataFromProps);
                }

                Store.get(prefillKey, path, defaultValue)
                    .then(data => component.setState({[propertyName]: data}));
            }

            // Load the data from an API request if necessary
            if (loader) {
                const paramsForLoaderFunction = _.map(loaderParams, (loaderParam) => {
                    // Some params might com from the props data
                    if (loaderParam === '%DATAFROMPROPS%') {
                        return get(this.props, pathForProps);
                    }
                    return loaderParam;
                });
                loader(...paramsForLoaderFunction || []);
            }
        }

        /**
         * Unsubscribe from any subscriptions
         */
        unbind() {
            _.each(this.subscriptionIDs, Store.unbind);
            _.each(this.subscriptionIDsWithPropsData, Store.unbind);
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
                />
            );
        }
    };
}
