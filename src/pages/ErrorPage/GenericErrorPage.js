import React from 'react';
import {useErrorBoundary} from 'react-error-boundary';
import {View} from 'react-native';
import LogoWordmark from '@assets/images/expensify-wordmark.svg';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import * as StyleUtils from '@styles/StyleUtils';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ErrorBodyText from './ErrorBodyText';

const propTypes = {
    ...withLocalizePropTypes,
};

function GenericErrorPage({translate}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {resetBoundary} = useErrorBoundary();

    return (
        <SafeAreaConsumer>
            {({paddingBottom}) => (
                <View style={[styles.flex1, styles.pt10, styles.ph5, StyleUtils.getErrorPageContainerStyle(paddingBottom)]}>
                    <View style={[styles.flex1, styles.alignItemsCenter, styles.justifyContentCenter]}>
                        <View>
                            <View style={styles.mb5}>
                                <Icon
                                    src={Expensicons.Bug}
                                    height={variables.componentSizeNormal}
                                    width={variables.componentSizeNormal}
                                    fill={theme.iconSuccessFill}
                                />
                            </View>
                            <View style={styles.mb5}>
                                <Text style={[styles.textHeadline]}>{translate('genericErrorPage.title')}</Text>
                            </View>
                            <View style={styles.mb5}>
                                <ErrorBodyText />
                                <Text>
                                    {`${translate('genericErrorPage.body.helpTextConcierge')} `}
                                    <TextLink
                                        href={`mailto:${CONST.EMAIL.CONCIERGE}`}
                                        style={[styles.link]}
                                    >
                                        {CONST.EMAIL.CONCIERGE}
                                    </TextLink>
                                </Text>
                            </View>
                            <View style={[styles.flexRow]}>
                                <View style={[styles.flex1, styles.flexRow]}>
                                    <Button
                                        success
                                        medium
                                        onPress={resetBoundary}
                                        text={translate('genericErrorPage.refresh')}
                                        style={styles.mr3}
                                    />
                                    <Button
                                        medium
                                        onPress={() => {
                                            Session.signOutAndRedirectToSignIn();
                                            resetBoundary();
                                        }}
                                        text={translate('initialSettingsPage.signOut')}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                    <View styles={styles.alignSelfEnd}>
                        <View style={[styles.flex1, styles.flexRow, styles.justifyContentCenter]}>
                            <LogoWordmark
                                height={30}
                                width={80}
                                fill={theme.textLight}
                            />
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaConsumer>
    );
}

GenericErrorPage.propTypes = propTypes;
GenericErrorPage.displayName = 'ErrorPage';

export default withLocalize(GenericErrorPage);
