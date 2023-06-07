import React from 'react';
import {View} from 'react-native';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ROUTES from '../../../../ROUTES';
import Navigation from '../../../../libs/Navigation/Navigation';
import TextInput from '../../../../components/TextInput';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import {BigEmojiPicker} from '../../../../components/CustomStatus/BigEmojiPicker';

function SetStatusPage() {
    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title="Status"
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
            />

            <Text style={[styles.textLabel]}>Add an emoji to give your colleagues and friends an easy way to know what's going on. You can optionally add a message too!</Text>

            <BigEmojiPicker />

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
