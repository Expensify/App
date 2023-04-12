import React from 'react';
import {Pressable} from 'react-native';
import _ from 'lodash';
const GenericPressable = (props) => {
    const rest = _.omit(props, ['children']);

    return (
        <Pressable
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...rest}
        >
            {props.children}
        </Pressable>
);
};

GenericPressable.displayName = 'GenericPressable';
GenericPressable.propTypes = genericPressablePropTypes.propTypes;
GenericPressable.defaultProps = genericPressablePropTypes.defaultProps;

export default GenericPressable;
