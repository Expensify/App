import React, {forwardRef} from 'react';
import {FlatList} from 'react-native';

/**
 * Inverted FlatList for native is just the base FlatList
 */
export default forwardRef((props, forwardedRef) => (
    <FlatList
        {...props}
        data={props.data}
        ref={forwardedRef}
        inverted
    />
));
