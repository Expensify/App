import React from 'react';
import styles from '../../../style/StyleSheet';
import Anchor from '../../../components/Anchor';

const AppLinks = () => (
    <>
        <Anchor
            style={[styles.sidebarFooterLink, styles.mr2]}
            href="https://chat.expensify.com/Chat.dmg"
        >
            Desktop
        </Anchor>
        <Anchor
            style={[styles.sidebarFooterLink, styles.mr2]}
            href="https://testflight.apple.com/join/ucuXr4g5"
        >
            iOS
        </Anchor>
        <Anchor
            style={[styles.sidebarFooterLink, styles.mr2]}
            href="https://play.google.com/apps/internaltest/4700657970395613233"
        >
            Android
        </Anchor>
    </>
);

export default AppLinks;
