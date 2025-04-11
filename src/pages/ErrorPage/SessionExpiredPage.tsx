import HybridAppModule from '@expensify/react-native-hybrid-app';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {clearSignInData} from '@userActions/Session';
import CONFIG from '@src/CONFIG';

function SessionExpiredPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();

    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={200}
                        height={164}
                        src={Illustrations.RocketBlue}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge]}>{translate('deeplinkWrapper.launching')}</Text>
                <View style={styles.mt2}>
                    <Text style={styles.textAlignCenter}>
                        {translate('deeplinkWrapper.expired')}{' '}
                        <TextLink
                            onPress={() => {
                                if (!CONFIG.IS_HYBRID_APP) {
                                    clearSignInData();
                                    Navigation.goBack();
                                    return;
                                }
                                HybridAppModule.closeReactNativeApp({shouldSignOut: true, shouldSetNVP: false});
                            }}
                        >
                            {translate('deeplinkWrapper.signIn')}
                        </TextLink>
                    </Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={154}
                    height={34}
                    fill={theme.success}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

SessionExpiredPage.displayName = 'SessionExpiredPage';

export default SessionExpiredPage;
