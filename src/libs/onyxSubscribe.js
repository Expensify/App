import Onyx from 'react-native-onyx';

/**
 * Connect to onyx data. Same params as Onyx.connect(), but returns a function to unsubscribe.
 *
 * @param {Object} mapping Same as for Onyx.connect()
 * @return {function(): void} Unsubscribe callback
 */
export default (mapping) => {
    const connectionId = Onyx.connect(mapping);
    return () => Onyx.disconnect(connectionId);
};
