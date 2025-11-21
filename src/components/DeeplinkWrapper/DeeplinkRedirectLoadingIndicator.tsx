import {emailSelector} from '@selectors/Session';
import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';

type DeeplinkRedirectLoadingIndicatorProps = {
    /** Opens the link in the browser */
    openLinkInBrowser: (value: boolean) => void;
};

function DeeplinkRedirectLoadingIndicator({openLinkInBrowser}: DeeplinkRedirectLoadingIndicatorProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['ExpensifyWordmark'] as const);
    const illustrations = useMemoizedLazyIllustrations(['RocketBlue'] as const);
    const [currentUserLogin] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: true});
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
                <View style={[styles.mt2, styles.textAlignCenter]}>
                    <Text>{translate('deeplinkWrapper.loggedInAs', {email: currentUserLogin ?? ''})}</Text>
                    <Text style={[styles.textAlignCenter]}>
                        {translate('deeplinkWrapper.doNotSeePrompt')} <TextLink onPress={() => openLinkInBrowser(true)}>{translate('deeplinkWrapper.tryAgain')}</TextLink>
                        {translate('deeplinkWrapper.or')} <TextLink onPress={() => Navigation.goBack()}>{translate('deeplinkWrapper.continueInWeb')}</TextLink>.
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

DeeplinkRedirectLoadingIndicator.displayName = 'DeeplinkRedirectLoadingIndicator';

export default DeeplinkRedirectLoadingIndicator;
