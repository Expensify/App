import React, {memo} from 'react';
import PropTypes from 'prop-types';
import {Pressable, Text} from 'react-native';


const propTypes = {
    iconCode: PropTypes.elementType.isRequired,
};

const EmojiPickerMenuItem = props => (
    <Pressable>
        {() => (
            <>
                <Text

                    selectable
                >
                    {props.iconCode}
                </Text>
            </>
        )}
    </Pressable>
);


EmojiPickerMenuItem.propTypes = propTypes;
EmojiPickerMenuItem.displayName = 'EmojiPickerMenuItem';

export default memo(EmojiPickerMenuItem);
