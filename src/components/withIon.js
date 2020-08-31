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
                    if (lodashHas(mapping, 'pathForProps')) {
                        const prevPropsData = lodashGet(prevProps, mapping.pathForProps);
                        const currentPropsData = lodashGet(this.props, mapping.pathForProps);
                        if (prevPropsData !== currentPropsData) {
                            Ion.disconnect(this.activeConnectionIDsWithPropsData[mapping.pathForProps]);
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
             * @param {string} [mapping.path] a specific path of the store object to map to the state
             * @param {mixed} [mapping.defaultValue] Used in conjunction with mapping.path to return if the there is
             *  nothing at mapping.path
             * @param {boolean} [mapping.addAsCollection] rather than setting a single state value, this will add things
             *  to an array
             * @param {string} [mapping.collectionID] the name of the ID property to use for the collection
             * @param {string} [mapping.pathForProps] the statePropertyName can contain the string %DATAFROMPROPS% wich
             *  will be replaced with data from the props matching this path. That way, the component can connect to an
             *  Ion key that uses data from this.props.
             *
             *  For example, if a component wants to connect to the Ion key "report_22" and
             *  "22" comes from this.props.match.params.reportID. The statePropertyName would be set to
             *  "report_%DATAFROMPROPS%" and pathForProps would be set to "match.params.reportID"
             * @param {function} [mapping.loader] a method that will be called after connection to Ion in order to load
             *  it with data. Typically this will be a method that makes an XHR to load data from the API.
             * @param {mixed[]} [mapping.loaderParams] An array of params to be passed to the loader method
             * @param {boolean} [mapping.initWithStoredValues] If set to false, then no data will be prefilled into the
             *  component
             * @param {string} statePropertyName the name of the state property that Ion will add the data to
             */
            connectMappingToIon(mapping, statePropertyName) {
                const ionConnectionConfig = {
                    ...mapping,
                    statePropertyName,
                    withIonInstance: this,
                };

                let connectionID;

                // Connect to Ion and keep track of the connectionID
                if (mapping.pathForProps) {
                    // If there is a path for props data, then the data needs to be pulled out of props and parsed
                    // into the key
                    const dataFromProps = lodashGet(this.props, mapping.pathForProps);
                    const keyWithPropsData = mapping.key.replace('%DATAFROMPROPS%', dataFromProps);
                    ionConnectionConfig.key = keyWithPropsData;

                    // Store the connectionID with a key that is unique to the data coming from the props which allows
                    // it to be easily reconnected to when the props change
                    connectionID = Ion.connect(ionConnectionConfig);
                    this.activeConnectionIDsWithPropsData[mapping.pathForProps] = connectionID;
                } else {
                    connectionID = Ion.connect(ionConnectionConfig);
                    this.actionConnectionIDs[connectionID] = connectionID;
                }

                // Pre-fill the state with any data already in the store
                if (mapping.initWithStoredValues !== false) {
                    Ion.getInitialStateFromConnectionID(connectionID)
                        .then(data => this.setState({[statePropertyName]: data}));
                }

                // Load the data from an API request if necessary
                if (mapping.loader) {
                    const paramsForLoaderFunction = _.map(mapping.loaderParams, (loaderParam) => {
                        // Some params might com from the props data
                        if (loaderParam === '%DATAFROMPROPS%') {
                            return lodashGet(this.props, mapping.pathForProps);
                        }
                        return loaderParam;
                    });

                    // Call the loader function and pass it any params. The loader function will take care of putting
                    // data into Ion
                    mapping.loader(...paramsForLoaderFunction || []);
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
