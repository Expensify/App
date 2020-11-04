/**
 * This is a higher order component that provides the ability to map a state property directly to
 * something in Ion (a key/value store). That way, as soon as data in Ion changes, the state will be set and the view
 * will automatically change to reflect the new data.
 */
import React from 'react';
import _ from 'underscore';
import Ion from '../libs/Ion';
import Str from '../libs/Str';

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
                // disconnected. It is a key value store with the format {[mapping.key]: connectionID}.
                this.activeConnectionIDs = {};

                this.state = {
                    loading: true,
                };
            }

            componentDidMount() {
                // Subscribe each of the state properties to the proper Ion key
                _.each(mapIonToState, (mapping, propertyName) => {
                    this.connectMappingToIon(mapping, propertyName);
                });
                this.checkAndUpdateLoading();
            }

            componentDidUpdate(prevProps) {
                // If any of the mappings use data from the props, then when the props change, all the
                // connections need to be reconnected with the new props
                _.each(mapIonToState, (mapping, propertyName) => {
                    const previousKey = Str.result(mapping.key, prevProps);
                    const newKey = Str.result(mapping.key, this.props);

                    if (previousKey !== newKey) {
                        Ion.disconnect(this.activeConnectionIDs[previousKey], previousKey);
                        delete this.activeConnectionIDs[previousKey];
                        this.connectMappingToIon(mapping, propertyName);
                    }
                });
                this.checkAndUpdateLoading();
            }

            componentWillUnmount() {
                // Disconnect everything from Ion
                _.each(mapIonToState, (mapping) => {
                    const key = Str.result(mapping.key, this.props);
                    const connectionID = this.activeConnectionIDs[key];
                    Ion.disconnect(connectionID, key);
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

                    const canEvict = Str.result(mapping.canEvict, this.props);
                    const key = Str.result(mapping.key, this.props);

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
                const key = Str.result(mapping.key, this.props);
                const connectionID = Ion.connect({
                    ...mapping,
                    key,
                    statePropertyName,
                    withIonInstance: this,
                });

                this.activeConnectionIDs[key] = connectionID;
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
