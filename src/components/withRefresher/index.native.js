import React from 'react';

/**
 * Native devices can only receive code updates through the traditional download/update process,
 * so this module does nothing on those platforms.
 *
 * @param {React.Component} WrappedComponent
 * @returns {React.Component}
 */
// eslint-disable-next-line react/jsx-props-no-spreading
export default WrappedComponent => props => <WrappedComponent {...props} />;
