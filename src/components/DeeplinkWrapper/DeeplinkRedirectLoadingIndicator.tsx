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
import ONYXKEYS from '@src/ONYXKEYS';

type DeeplinkRedirectLoadingIndicatorProps = {
    /** Opens the link in the browser */
    openLinkInBrowser: (value: boolean) => void;
};

function DeeplinkRedirectLoadingIndicator({openLinkInBrowser}: DeeplinkRedirectLoadingIndicatorProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const [email] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email ?? ''});
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
                <View style={[styles.mt2, styles.textAlignCenter]}>
                    <Text>{translate('deeplinkWrapper.loggedInAs', {email})}</Text>
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
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

DeeplinkRedirectLoadingIndicator.displayName = 'DeeplinkRedirectLoadingIndicator';

export default DeeplinkRedirectLoadingIndicator;
