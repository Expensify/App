import React from 'react';
import {FlatList, Keyboard} from 'react-native';

function KeyboardDismissingFlatList(props) {
    return (
        <FlatList
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            onScrollBeginDrag={() => Keyboard.dismiss()}
        />
    );
}

KeyboardDismissingFlatList.displayName = 'KeyboardDismissingFlatList';

export default KeyboardDismissingFlatList;
