/**
 * This is a higher order component that provides the ability to map a state property directly to
 * something in the store. That way, as soon as the store changes, the state will be set and the view
 * will automatically change to reflect the new data.
 */
import React from 'react';
import _ from 'underscore';
import get from 'lodash.get';
import has from 'lodash.has';
import Ion from '../lib/Ion';

export default function (mapIonToState) {
    return WrappedComponent => class WithIon extends React.Component {
        constructor(props) {
            super(props);

            this.connectionIDs = {};
            this.connectionIDsWithPropsData = {};

            // Initialize the state with each of the property names from the mapping
            this.state = _.reduce(_.keys(mapIonToState), (finalResult, propertyName) => ({
                ...finalResult,
                [propertyName]: null,
            }), {});
        }

        componentDidMount() {
            // Subscribe each of the state properties to the proper store key
            _.each(mapIonToState, (mapping, propertyName) => {
                this.connectSingleMappingToIon(mapping, propertyName, this.wrappedComponent);
            });
        }

        componentDidUpdate(prevProps) {
            // If any of the mappings use data from the props, then when the props change, all the
            // subscriptions need to be rebound with the new props
            _.each(mapIonToState, (mapping, propertyName) => {
                if (has(mapping, 'pathForProps')) {
                    const prevPropsData = get(prevProps, mapping.pathForProps);
                    const currentPropsData = get(this.props, mapping.pathForProps);
                    if (prevPropsData !== currentPropsData) {
                        Ion.unbind(this.connectionIDsWithPropsData[mapping.pathForProps]);
                        this.connectSingleMappingToIon(mapping, propertyName, this.wrappedComponent);
                    }
                }
            });
        }

        componentWillUnmount() {
            this.disconnect();
        }

        /**
         * Takes a single mapping and binds the state of the component to the store
         *
         * @param {object} mapping
         * @param {string} propertyName
         * @param {object} component
         */
        connectSingleMappingToIon(mapping, propertyName, component) {
            const {
                key,
                path,
                prefillWithKey,
                loader,
                loaderParams,
                defaultValue,
                pathForProps,
                addAsCollection,
                collectionId,
            } = mapping;

            // Bind to the store and keep track of the subscription ID
            if (pathForProps) {
                // If there is a path for props data, then the data needs to be pulled out of props and parsed
                // into the key
                const dataFromProps = get(this.props, pathForProps);
                const keyWithPropsData = key.replace('%DATAFROMPROPS%', dataFromProps);
                const connectionID = Ion.bind(
                    keyWithPropsData,
                    path,
                    defaultValue,
                    propertyName,
                    addAsCollection,
                    collectionId,
                    component
                );

                // Store the subscription ID it with a key that is unique to the data coming from the props
                this.connectionIDsWithPropsData[pathForProps] = connectionID;
            } else {
                const connectionID = Ion.bind(
                    key,
                    path,
                    defaultValue,
                    propertyName,
                    addAsCollection,
                    collectionId,
                    component
                );
                this.connectionIDs[connectionID] = connectionID;
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

                Ion.get(prefillKey, path, defaultValue)
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
        disconnect() {
            _.each(this.connectionIDs, Ion.unbind);
            _.each(this.connectionIDsWithPropsData, Ion.unbind);
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
