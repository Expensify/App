import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import styles from '../../styles/styles';
import {restartSignin} from '../../libs/actions/Session';
import themeColors from '../../styles/themes/default';

const ChangeExpensifyLoginLink = () => (
    <View style={[styles.mb4]}>
        <TouchableOpacity
            style={[styles.link]}
            onPress={restartSignin}
            underlayColor={themeColors.componentBG}
        >
            <Text style={[styles.link]}>
                Change Expensify login
            </Text>
        </TouchableOpacity>
    </View>
);

ChangeExpensifyLoginLink.displayName = 'ChangeExpensifyLoginLink';

export default ChangeExpensifyLoginLink;
