import React, {useRef, useState, useEffect} from 'react';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../styles/styles';
import Text from '../Text';
import * as EmojiPicker from '../../libs/actions/EmojiPickerAction';

function BigEmojiPicker(props) {
    const emojiPickerRef = useRef(null);

    const [emoji, setEmoji] = useState('💬');

    useEffect(() => {
        props.onChangeEmoji(emoji);
    }, [props.onChangeEmoji, emoji]);

    return (
        <Pressable
            ref={emojiPickerRef}
            onPress={() => {
                EmojiPicker.showEmojiPicker(() => {}, setEmoji, emojiPickerRef.current);
            }}
        >
            <Text style={styles.textXXLarge}>{emoji}</Text>
        </Pressable>
    );
}

BigEmojiPicker.displayName = 'BigEmojiPicker';
BigEmojiPicker.propTypes = {
    onChangeEmoji: PropTypes.func.isRequired,
};

export default BigEmojiPicker;
