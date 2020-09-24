import React, {forwardRef} from 'react';
import {FlatList} from 'react-native';

/**
 * Inverted FlatList for native is just the base FlatList
 */
export default forwardRef((props, forwardedRef) => (
    <FlatList
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
        data={props.data.slice().reverse()}
        ref={forwardedRef}
        inverted
    />
));
