import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
// eslint-disable-next-line no-restricted-imports
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import {beginSignIn} from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';

function ExpiredValidateCodeModal() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['ToddBehindCloud'] as const);
    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={variables.modalTopIconWidth}
                        height={variables.modalTopIconHeight}
                        src={illustrations.ToddBehindCloud}
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
                                    beginSignIn(credentials?.login ?? '');
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
