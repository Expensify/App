import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';

function ExpiredValidateCodeModal() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const {translate} = useLocalize();
    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={variables.modalTopIconWidth}
                        height={variables.modalTopIconHeight}
                        src={Illustrations.ToddBehindCloud}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge, styles.textAlignCenter]}>{translate('validateCodeModal.expiredCodeTitle')}</Text>
                <View style={[styles.mt2, styles.mb2]}>
                    {credentials?.login ? (
                        <Text style={styles.textAlignCenter}>
                            {translate('validateCodeModal.expiredCodeDescription')}
                            {translate('validateCodeModal.or')}{' '}
                            <TextLink
                                onPress={() => {
                                    Session.beginSignIn(credentials?.login ?? '');
                                    Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
                                }}
                            >
                                {translate('validateCodeModal.requestOneHere')}
                            </TextLink>
                        </Text>
                    ) : (
                        <Text style={styles.textAlignCenter}>{translate('validateCodeModal.expiredCodeDescription')}.</Text>
                    )}
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={variables.modalWordmarkWidth}
                    height={variables.modalWordmarkHeight}
                    fill={theme.success}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

ExpiredValidateCodeModal.displayName = 'ExpiredValidateCodeModal';
export default ExpiredValidateCodeModal;
