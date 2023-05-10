import React from 'react';
import {Pressable} from 'react-native';

const ButtonBase = ({onPress, icon}) => (
    <Pressable onPress={onPress} style={style}>
        {icon}
    </Pressable>
);

const style = {
    margin: 10,
};

ButtonBase.displayName = 'ButtonBase';

export default ButtonBase;
