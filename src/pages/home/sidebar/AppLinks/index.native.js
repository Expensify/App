import React from 'react';
import styles from '../../../../styles/styles';
import openURLInNewTab from '../../../../libs/openURLInNewTab';
import Text from '../../../../components/Text';

const AppLinks = () => (
    <>
        <Text
            style={[styles.sidebarFooterLink, styles.mr2]}
            onPress={() => openURLInNewTab('https://chat.expensify.com/')}
        >
            View on web
        </Text>
    </>
);

export default AppLinks;
