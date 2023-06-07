import React, {useRef} from 'react';
import {Pressable} from 'react-native';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ROUTES from '../../../../ROUTES';
import Navigation from '../../../../libs/Navigation/Navigation';
import TextInput from '../../../../components/TextInput';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import * as EmojiPicker from '../../../../libs/actions/EmojiPickerAction';

function SetStatusPage() {
    const emojiPickerRef = useRef(null);

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title="Status"
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
            />

            <Text style={[styles.textLabel]}>Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!</Text>

            <Pressable
                ref={emojiPickerRef}
                onPress={() => {
                    console.log('onTouchStart');
                    EmojiPicker.showEmojiPicker(
                        () => {},
                        () => {},
                        emojiPickerRef.current,
                    );
                }}
                style={{
                    height: 50,
                    width: 50,
                    backgroundColor: 'lightblue',
                }}
            />

            <TextInput
                // inputID="firstName"
                // name="fname"
                label="Message"
                maxLength={128}
                autoCapitalize="words"
            />
        </ScreenWrapper>
    );
}

SetStatusPage.displayName = 'SetStatusPage';

export default SetStatusPage;
