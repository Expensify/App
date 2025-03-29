/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Text from '@components/Text';
import type {ThemeStyles} from '@styles/index';

function Concierge({styles}: {styles: ThemeStyles}) {
    return (
        <>
            <Text style={[styles.textHeadlineH1, styles.mb4]}>Concierge</Text>
            <Text style={styles.textNormal}>
                Concierge is available 24/7 to answer any question you have about anything, whether that's how to get set up, how to fix a problem, or general best practices. Concierge is a
                bot, but is really smart, and can escalate you to a human whenever you want. Say hi, it's friendly!
            </Text>
        </>
    );
}

export default Concierge;
