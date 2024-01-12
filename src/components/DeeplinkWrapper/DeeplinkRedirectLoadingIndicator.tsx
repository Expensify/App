import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type DeeplinkRedirectLoadingIndicatorOnyxProps = {
    /** Current user session */
    session: OnyxEntry<OnyxTypes.Session>;
};

type DeeplinkRedirectLoadingIndicatorProps = DeeplinkRedirectLoadingIndicatorOnyxProps & {
    /** Opens the link in the browser */
    openLinkInBrowser: (value: boolean) => void;
};

function DeeplinkRedirectLoadingIndicator({openLinkInBrowser, session}: DeeplinkRedirectLoadingIndicatorProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();

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
                    <Text>{translate('deeplinkWrapper.loggedInAs', {email: session?.email ?? ''})}</Text>
                    <Text style={[styles.textAlignCenter]}>
                        {translate('deeplinkWrapper.doNotSeePrompt')} <TextLink onPress={() => openLinkInBrowser(true)}>{translate('deeplinkWrapper.tryAgain')}</TextLink>
                        {translate('deeplinkWrapper.or')} <TextLink onPress={() => Navigation.navigate(ROUTES.HOME)}>{translate('deeplinkWrapper.continueInWeb')}</TextLink>.
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

export default withOnyx<DeeplinkRedirectLoadingIndicatorProps, DeeplinkRedirectLoadingIndicatorOnyxProps>({
    session: {
        key: ONYXKEYS.SESSION,
    },
})(DeeplinkRedirectLoadingIndicator);
