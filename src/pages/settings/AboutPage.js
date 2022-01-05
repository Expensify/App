import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import ExpensifyText from '../../components/ExpensifyText';
import CONST from '../../CONST';
import * as Expensicons from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import Logo from '../../../assets/images/new-expensify.svg';
import {version} from '../../../package.json';
import * as Report from '../../libs/actions/Report';
import * as Link from '../../libs/actions/Link';

const propTypes = {
    ...withLocalizePropTypes,
};

const AboutPage = (props) => {
    const menuItems = [
        {
            translationKey: 'initialSettingsPage.aboutPage.appDownloadLinks',
            icon: Expensicons.Link,
            action: () => {
                Navigation.navigate(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS);
            },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.viewTheCode',
            icon: Expensicons.Eye,
            iconRight: Expensicons.NewWindow,
            action: () => {
                Link.openExternalLink(CONST.GITHUB_URL);
            },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.viewOpenJobs',
            icon: Expensicons.MoneyBag,
            iconRight: Expensicons.NewWindow,
            action: () => {
                Link.openExternalLink(CONST.UPWORK_URL);
            },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.reportABug',
            icon: Expensicons.Bug,
            action: Report.navigateToConciergeChat,
        },
    ];

    return (
        <ScreenWrapper>
            <HeaderWithCloseButton
                title={props.translate('initialSettingsPage.about')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <ScrollView
                contentContainerStyle={[
                    styles.flexGrow1,
                    styles.flexColumn,
                    styles.justifyContentBetween,
                ]}
            >
                <View style={[styles.flex1]}>
                    <View style={styles.pageWrapper}>
                        <View style={[styles.settingsPageBody, styles.mb6, styles.alignItemsCenter]}>
                            <Logo height={80} width={80} />
                            <ExpensifyText
                                style={[
                                    styles.textLabel,
                                    styles.alignSelfCenter,
                                    styles.mt6,
                                    styles.mb2,
                                    styles.colorMuted,
                                ]}
                            >
                                v
                                {version}
                            </ExpensifyText>
                            <ExpensifyText style={[styles.baseFontStyle, styles.mv5]}>
                                {props.translate('initialSettingsPage.aboutPage.description')}
                            </ExpensifyText>
                        </View>
                    </View>
                    {_.map(menuItems, item => (
                        <MenuItem
                            key={item.translationKey}
                            title={props.translate(item.translationKey)}
                            icon={item.icon}
                            iconRight={item.iconRight}
                            onPress={() => item.action()}
                            shouldShowRightIcon
                        />
                    ))}
                </View>
                <View style={[styles.sidebarFooter]}>
                    <ExpensifyText
                        style={[styles.chatItemMessageHeaderTimestamp]}
                        numberOfLines={1}
                    >
                        {props.translate(
                            'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase1',
                        )}
                        {' '}
                        <ExpensifyText
                            style={[styles.textMicroSupporting, styles.link]}
                            href={CONST.TERMS_URL}
                        >
                            {props.translate(
                                'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase2',
                            )}
                        </ExpensifyText>
                        {' '}
                        {props.translate(
                            'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase3',
                        )}
                        {' '}
                        <ExpensifyText
                            style={[styles.textMicroSupporting, styles.link]}
                            href={CONST.PRIVACY_URL}
                        >
                            {props.translate(
                                'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase4',
                            )}
                        </ExpensifyText>
                        .
                    </ExpensifyText>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

AboutPage.propTypes = propTypes;
AboutPage.displayName = 'AboutPage';

export default withLocalize(AboutPage);
