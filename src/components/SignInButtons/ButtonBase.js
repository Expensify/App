import React from 'react';
import { Pressable } from 'react-native';
import PropTypes from 'prop-types';

const style = {
    margin: 10,
    padding: 2,
};

const propTypes = {
    
    /** The on press method */
    onPress: PropTypes.func,

    /** The icon to render */
    icon: PropTypes.element,
};

const defaultProps = {
    onPress: () => { },
    icon: null,
};


const ButtonBase = ({onPress, icon}) => (
    <Pressable
        onPress={onPress}
        style={style}
    >
        {icon}
    </Pressable>
);

ButtonBase.displayName = 'ButtonBase';
ButtonBase.propTypes = propTypes;
ButtonBase.defaultProps = defaultProps;

export default ButtonBase;
