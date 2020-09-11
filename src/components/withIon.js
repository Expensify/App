/**
 * This is a higher order component that provides the ability to map a state property directly to
 * something in Ion (a key/value store). That way, as soon as data in Ion changes, the state will be set and the view
 * will automatically change to reflect the new data.
 */
import React from 'react';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import lodashHas from 'lodash.has';
import Ion from '../lib/Ion';

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
            }

            componentDidMount() {
                // Subscribe each of the state properties to the proper Ion key
                _.each(mapIonToState, (mapping, propertyName) => {
                    this.connectMappingToIon(mapping, propertyName, this.wrappedComponent);
                });
            }

            componentDidUpdate(prevProps) {
                // If any of the mappings use data from the props, then when the props change, all the
                // connections need to be reconnected with the new props
                _.each(mapIonToState, (mapping, propertyName) => {
                    if (_.isFunction(mapping.key)) {
                        const previousKey = mapping.key(prevProps);
                        const newKey = mapping.key(this.props);
                        if (previousKey !== newKey) {
                            Ion.disconnect(this.activeConnectionIDsWithPropsData[previousKey]);
                            this.connectMappingToIon(mapping, propertyName, this.wrappedComponent);
                        }
                    }
                });
            }

            componentWillUnmount() {
                // Disconnect everything from Ion
                _.each(this.actionConnectionIDs, Ion.disconnect);
                _.each(this.activeConnectionIDsWithPropsData, Ion.disconnect);
            }

            /**
             * Takes a single mapping and binds the state of the component to the store
             *
             * @param {object} mapping
             * @param {string} statePropertyName the name of the state property that Ion will add the data to
             * @param {string} [mapping.indexBy] the name of the ID property to use for the collection
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
            }

            render() {
                // Spreading props and state is necessary in an HOC where the data cannot be predicted
                return (
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...this.props}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...this.state}
                    />
                );
            }
        }

        withIon.displayName = `withIon(${getDisplayName(WrappedComponent)})`;
        return withIon;
    };
}
