import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import React, {useEffect} from 'react';
import {View} from 'react-native';

/** Wise redirects its embedded page here when the customer finishes; when framed, tell the parent page so it can close */
function WiseKYCCompletePage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ConnectionComplete', 'ExpensifyWordmark']);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.parent || window.parent === window) {
            return;
        }
        window.parent.postMessage('done', '*');
    }, []);

    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={272}
                        height={188}
                        src={icons.ConnectionComplete}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textAlignCenter]}>{translate('wiseKYC.complete.title')}</Text>
                <View style={[styles.mt2, styles.mb2, {maxWidth: 280}]}>
                    <Text style={styles.textAlignCenter}>{translate('wiseKYC.complete.supportingText')}</Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={variables.modalWordmarkWidth}
                    height={variables.modalWordmarkHeight}
                    fill={theme.success}
                    src={icons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

export default WiseKYCCompletePage;
