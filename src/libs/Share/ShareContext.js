import PropTypes from 'prop-types';
import React from 'react';

const ShareContext = React.createContext(null);

function Provider(props) {
    return <ShareContext.Provider value={null}>{props.children}</ShareContext.Provider>;
}

Provider.propTypes = {
    /** Actual content wrapped by this component */
    children: PropTypes.node.isRequired,
};

const useShareData = () => null;

export default {Provider, useShareData};
