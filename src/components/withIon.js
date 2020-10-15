/**
 * This is a higher order component that provides the ability to map a state property directly to
 * something in Ion (a key/value store). That way, as soon as data in Ion changes, the state will be set and the view
 * will automatically change to reflect the new data.
 */
import React from 'react';
import _ from 'underscore';
import Ion from '../libs/Ion';

/**
 * Returns the display name of a component
 *
 * @param {object} component
 * @returns {string}
 */
function getDisplayName(component) {
    return component.displayName || component.name || 'Component';
}

export default function (mapIonToState) {
    return (WrappedComponent) => {
        class withIon extends React.Component {
            constructor(props) {
                super(props);

                // This stores all the Ion connection IDs to be used when the component unmounts so everything can be
                // disconnected
                this.actionConnectionIDs = {};

                // This stores all of the Ion connection IDs from the mappings where they Ion key uses data from
                // this.props. These are stored differently because anytime the props change, the component has to be
                // reconnected to Ion with the new props.
                this.activeConnectionIDsWithPropsData = {};

                this.state = {
                    loading: true,
                };
            }

            componentDidMount() {
                // Subscribe each of the state properties to the proper Ion key
                _.each(mapIonToState, (mapping, propertyName) => {
                    this.connectMappingToIon(mapping, propertyName, this.wrappedComponent);
                });
                this.checkAndUpdateLoading();
            }

            componentDidUpdate(prevProps) {
                // If any of the mappings use data from the props, then when the props change, all the
                // connections need to be reconnected with the new props
                _.each(mapIonToState, (mapping, propertyName) => {
                    if (_.isFunction(mapping.key)) {
                        const previousKey = mapping.key(prevProps);
                        const newKey = mapping.key(this.props);

                        if (previousKey !== newKey) {
                            // If we have a canEvict property and we are unsubscribing we should
                            // remove this key from the blocklist.
                            if (!_.isUndefined(mapping.canEvict) && Ion.isSafeEvictionKey(previousKey)) {
                                Ion.removeFromEvictionBlockList(previousKey, mapping.connectionID);
                            }

                            Ion.disconnect(this.activeConnectionIDsWithPropsData[previousKey]);
                            this.connectMappingToIon(mapping, propertyName, this.wrappedComponent);
                        }
                    }
                });
                this.checkAndUpdateLoading();
            }

            componentWillUnmount() {
                // Disconnect everything from Ion
                _.each(this.actionConnectionIDs, Ion.disconnect);
                _.each(this.activeConnectionIDsWithPropsData, Ion.disconnect);

                // Remove this key from the eviction block list as we are no longer
                // subscribing to it and should ignore whatever value it had for canEvict
                _.each(mapIonToState, (mapping) => {
                    const key = _.isFunction(mapping.key) ? mapping.key(this.props) : mapping.key;
                    if (_.isUndefined(mapping.canEvict) && !Ion.isSafeEvictionKey(key)) {
                        return;
                    }
                    Ion.removeFromEvictionBlockList(key, mapping.connectionID);
                });
            }

            /**
             * Makes sure each Ion key we requested has been set to state with a value of some kind.
             * We are doing this so that the wrapped component will only render when all the data
             * it needs is available to it.
             */
            checkAndUpdateLoading() {
                // We will add this key to our list of recently accessed keys
                // if the canEvict function returns true. This is necessary criteria
                // we MUST use to specify if a key can be removed or not.
                _.each(mapIonToState, (mapping) => {
                    if (_.isUndefined(mapping.canEvict)) {
                        return;
                    }

                    const canEvict = _.isFunction(mapping.canEvict) ? mapping.canEvict(this.props) : mapping.canEvict;
                    const key = _.isFunction(mapping.key) ? mapping.key(this.props) : mapping.key;
                    if (!Ion.isSafeEvictionKey(key)) {
                        // eslint-disable-next-line max-len
                        throw new Error(`canEvict cannot be used on key '${key}'. This key must explicitly be flagged as safe for removal by adding it to Ion.init({safeEvictionKeys: []}).`);
                    }

                    if (canEvict) {
                        Ion.removeFromEvictionBlockList(key, mapping.connectionID);
                    } else {
                        Ion.addToEvictionBlockList(key, mapping.connectionID);
                    }
                });

                if (!this.state.loading) {
                    return;
                }

                // Filter all keys by those which we do want to init with stored values
                // since keys that are configured to not init with stored values will
                // never appear on state when the component mounts - only after they update
                // organically.
                const requiredKeysForInit = _.chain(mapIonToState)
                    .omit(config => config.initWithStoredValues === false)
                    .keys()
                    .value();

                // All state keys should exist and at least have a value of null
                if (_.every(requiredKeysForInit, key => !_.isUndefined(this.state[key]))) {
                    this.setState({loading: false});
                }
            }

            /**
             * Takes a single mapping and binds the state of the component to the store
             *
             * @param {object} mapping
             * @param {string|function} mapping.key key to connect to. can be a string or a
             * function that takes this.props as an argument and returns a string
             * @param {string} statePropertyName the name of the state property that Ion will add the data to
             * @param {boolean} [mapping.initWithStoredValues] If set to false, then no data will be prefilled into the
             *  component
             */
            connectMappingToIon(mapping, statePropertyName) {
                const ionConnectionConfig = {
                    ...mapping,
                    statePropertyName,
                    withIonInstance: this,
                };

                let connectionID;

                // Connect to Ion and keep track of the connectionID
                if (_.isFunction(mapping.key)) {
                    const keyFromProps = mapping.key(this.props);
                    ionConnectionConfig.key = keyFromProps;

                    // Store the connectionID with a key that is unique to the data coming from the props which allows
                    // it to be easily reconnected to when the props change
                    connectionID = Ion.connect(ionConnectionConfig);
                    this.activeConnectionIDsWithPropsData[keyFromProps] = connectionID;
                } else {
                    connectionID = Ion.connect(ionConnectionConfig);
                    this.actionConnectionIDs[connectionID] = connectionID;
                }

                // Add the connectionID to the mapping for reference
                // eslint-disable-next-line no-param-reassign
                mapping.connectionID = connectionID;
            }

            render() {
                if (this.state.loading) {
                    return null;
                }

                // Remove any internal state properties used by withIon
                // that should not be passed to a wrapped component
                const stateToPass = _.omit(this.state, 'loading');

                // Spreading props and state is necessary in an HOC where the data cannot be predicted
                return (
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...this.props}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...stateToPass}
                    />
                );
            }
        }

        withIon.displayName = `withIon(${getDisplayName(WrappedComponent)})`;
        return withIon;
    };
}
