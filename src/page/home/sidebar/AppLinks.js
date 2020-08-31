import React from 'react';
import styles from '../../../style/StyleSheet';
import Anchor from '../../../components/Anchor';

const AppLinks = () => (
    <>
        <Anchor
            style={[styles.sidebarFooterLink, styles.mr2]}
            href="https://chat.expensify.com/Chat.app.zip"
        >
            Desktop
        </Anchor>
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

export default AppLinks;
