/**
 * This is a higher order component that provides the ability to map a state property directly to
 * something in Onyx (a key/value store). That way, as soon as data in Onyx changes, the state will be set and the view
 * will automatically change to reflect the new data.
 */
import React from 'react';
import _ from 'underscore';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import Onyx from './Onyx';

/**
 * Returns the display name of a component
 *
 * @param {object} component
 * @returns {string}
 */
function getDisplayName(component) {
    return component.displayName || component.name || 'Component';
}

export default function (mapOnyxToState) {
    // A list of keys that must be present in tempState before we can render the WrappedComponent
    const requiredKeysForInit = _.chain(mapOnyxToState)
        .omit(config => config.initWithStoredValues === false)
        .keys()
        .value();

    return (WrappedComponent) => {
        class withOnyx extends React.Component {
            constructor(props) {
                super(props);

                this.setWithOnyxState = this.setWithOnyxState.bind(this);

                // This stores all the Onyx connection IDs to be used when the component unmounts so everything can be
                // disconnected. It is a key value store with the format {[mapping.key]: connectionID}.
                this.activeConnectionIDs = {};

                // Object holding the temporary initial state for the component while we load the various Onyx keys
                this.tempState = {};

                this.state = {
                    // If there are no required keys for init then we can render the wrapped component immediately
                    loading: requiredKeysForInit.length > 0,
                };
            }

            componentDidMount() {
                // Subscribe each of the state properties to the proper Onyx key
                _.each(mapOnyxToState, (mapping, propertyName) => {
                    this.connectMappingToOnyx(mapping, propertyName);
                });
                this.checkEvictableKeys();
            }

            componentDidUpdate(prevProps) {
                // If any of the mappings use data from the props, then when the props change, all the
                // connections need to be reconnected with the new props
                _.each(mapOnyxToState, (mapping, propertyName) => {
                    const previousKey = Str.result(mapping.key, prevProps);
                    const newKey = Str.result(mapping.key, this.props);

                    if (previousKey !== newKey) {
                        Onyx.disconnect(this.activeConnectionIDs[previousKey], previousKey);
                        delete this.activeConnectionIDs[previousKey];
                        this.connectMappingToOnyx(mapping, propertyName);
                    }
                });
                this.checkEvictableKeys();
            }

            componentWillUnmount() {
                // Disconnect everything from Onyx
                _.each(mapOnyxToState, (mapping) => {
                    const key = Str.result(mapping.key, this.props);
                    const connectionID = this.activeConnectionIDs[key];
                    Onyx.disconnect(connectionID, key);
                });
            }

            /**
             * This method is used externally by sendDataToConnection to prevent unnecessary renders while a component
             * still in a loading state. The temporary initial state is saved to the component instance and setState()
             * only called once all the necessary data has been collected.
             *
             * @param {String} statePropertyName
             * @param {*} val
             */
            setWithOnyxState(statePropertyName, val) {
                if (!this.state.loading) {
                    this.setState({[statePropertyName]: val});
                    return;
                }

                this.tempState[statePropertyName] = val;

                // All state keys should exist and at least have a value of null
                if (_.some(requiredKeysForInit, key => _.isUndefined(this.tempState[key]))) {
                    return;
                }

                this.setState({...this.tempState, loading: false});
                delete this.tempState;
            }

            /**
             * Makes sure each Onyx key we requested has been set to state with a value of some kind.
             * We are doing this so that the wrapped component will only render when all the data
             * it needs is available to it.
             */
            checkEvictableKeys() {
                // We will add this key to our list of recently accessed keys
                // if the canEvict function returns true. This is necessary criteria
                // we MUST use to specify if a key can be removed or not.
                _.each(mapOnyxToState, (mapping) => {
                    if (_.isUndefined(mapping.canEvict)) {
                        return;
                    }

                    const canEvict = Str.result(mapping.canEvict, this.props);
                    const key = Str.result(mapping.key, this.props);

                    if (!Onyx.isSafeEvictionKey(key)) {
                        throw new Error(`canEvict can't be used on key '${key}'. This key must explicitly be flagged as safe for removal by adding it to Onyx.init({safeEvictionKeys: []}).`);
                    }

                    if (canEvict) {
                        Onyx.removeFromEvictionBlockList(key, mapping.connectionID);
                    } else {
                        Onyx.addToEvictionBlockList(key, mapping.connectionID);
                    }
                });
            }

            /**
             * Takes a single mapping and binds the state of the component to the store
             *
             * @param {object} mapping
             * @param {string|function} mapping.key key to connect to. can be a string or a
             * function that takes this.props as an argument and returns a string
             * @param {string} statePropertyName the name of the state property that Onyx will add the data to
             * @param {boolean} [mapping.initWithStoredValues] If set to false, then no data will be prefilled into the
             *  component
             */
            connectMappingToOnyx(mapping, statePropertyName) {
                const key = Str.result(mapping.key, this.props);

                // eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs
                this.activeConnectionIDs[key] = Onyx.connect({
                    ...mapping,
                    key,
                    statePropertyName,
                    withOnyxInstance: this,
                });
            }

            render() {
                if (this.state.loading) {
                    return null;
                }

                // Remove any internal state properties used by withOnyx
                // that should not be passed to a wrapped component
                let stateToPass = _.omit(this.state, 'loading');
                stateToPass = _.omit(stateToPass, value => _.isNull(value));

                // Remove any null values so that React replaces them with default props
                const propsToPass = _.omit(this.props, value => _.isNull(value));

                // Spreading props and state is necessary in an HOC where the data cannot be predicted
                return (
                    <WrappedComponent
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...propsToPass}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...stateToPass}
                        ref={this.props.forwardedRef}
                    />
                );
            }
        }

        withOnyx.propTypes = {
            forwardedRef: PropTypes.oneOfType([
                PropTypes.func,
                PropTypes.shape({current: PropTypes.instanceOf(React.Component)}),
            ]),
        };
        withOnyx.defaultProps = {
            forwardedRef: undefined,
        };
        withOnyx.displayName = `withOnyx(${getDisplayName(WrappedComponent)})`;
        return React.forwardRef((props, ref) => {
            const Component = withOnyx;
            // eslint-disable-next-line react/jsx-props-no-spreading
            return <Component {...props} forwardedRef={ref} />;
        });
    };
}
