import React from 'react';
import {useErrorBoundary} from 'react-error-boundary';
import {View} from 'react-native';
import LogoWordmark from '@assets/images/expensify-wordmark.svg';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import ImageSVG from '@components/ImageSVG';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import refreshPage from '@libs/refreshPage';
import variables from '@styles/variables';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ErrorBodyText from './ErrorBodyText';

function GenericErrorPage() {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const {resetBoundary} = useErrorBoundary();

    return (
        <SafeAreaConsumer>
            {({paddingBottom}) => (
                <View style={[styles.flex1, styles.pt10, styles.ph5, StyleUtils.getErrorPageContainerStyle(Number(paddingBottom))]}>
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
                                        text={translate('genericErrorPage.refresh')}
                                        style={styles.mr3}
                                        onPress={() => refreshPage(resetBoundary)}
                                    />
                                    <Button
                                        text={translate('initialSettingsPage.signOut')}
                                        onPress={() => {
                                            Session.signOutAndRedirectToSignIn();
                                            refreshPage(resetBoundary);
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </View>
                    <View>
                        <View style={[styles.flex1, styles.flexRow, styles.justifyContentCenter]}>
                            <ImageSVG
                                contentFit="contain"
                                src={LogoWordmark}
                                height={30}
                                width={80}
                                fill={theme.text}
                            />
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaConsumer>
    );
}

GenericErrorPage.displayName = 'ErrorPage';

export default GenericErrorPage;
