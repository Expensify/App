import React from 'react';
import {Linking} from 'react-native';
import Text from '../../../components/Text';
import styles from '../../../style/StyleSheet';
import Anchor from '../../../components/Anchor';

const AppLinksView = () => {
    // Give instructions for downloading the desktop app
    function alertInstallInstructions() {
        alert('To install Chat Desktop App:\n\n'
            + '1. Double click "Chat.app.zip"\n'
            + '2. If you get a "Cannot be opened because the developer cannot be verified" error:\n'
            + '    1. Hit Cancel\n'
            + '    2. Go to System Preferences > Security & Privacy > General\n'
            + '    3. Click Open Anyway at the bottom\n'
            + '    4. When it re-prompts you, click Open');
        Linking.openURL('https://chat.expensify.com/Chat.app.zip');
    }

    return (
        <>
            <Text
                style={[styles.sidebarFooterLink, styles.mr2]}
                onPress={alertInstallInstructions}
            >
                Desktop
            </Text>
            <Anchor
                style={[styles.sidebarFooterLink, styles.mr2]}
                href="https://testflight.apple.com/join/vBYbMRQG"
            >
                iOS
            </Anchor>
            <Anchor
                style={[styles.sidebarFooterLink, styles.mr2]}
                href="https://chat.expensify.com/app-release.apk"
            >
                Android
            </Anchor>
        </>
    );
};

export default AppLinksView;
