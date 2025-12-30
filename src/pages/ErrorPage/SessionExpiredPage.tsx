import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import {clearSignInData} from '@userActions/Session';

function SessionExpiredPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark']);
    const illustrations = useMemoizedLazyIllustrations(['RocketBlue']);

    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={200}
                        height={164}
                        src={illustrations.RocketBlue}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge]}>{translate('deeplinkWrapper.launching')}</Text>
                <View style={styles.mt2}>
                    <Text style={styles.textAlignCenter}>
                        {translate('deeplinkWrapper.expired')}{' '}
                        <TextLink
                            onPress={() => {
                                clearSignInData();
                                Navigation.goBack();
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
                    src={icons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

export default SessionExpiredPage;
