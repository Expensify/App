import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import CONST from '../../CONST';
import {
    Link,
    Eye,
    MoneyBag,
    Bug,
    NewWindow,
} from '../../components/Icon/Expensicons';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import MenuItem from '../../components/MenuItem';
import Logo from '../../../assets/images/new-expensify.svg';
import {version} from '../../../package.json';
import {navigateToConciergeChat} from '../../libs/actions/Report';
import {openExternalLink} from '../../libs/actions/Link';

const propTypes = {
    ...withLocalizePropTypes,
};

const AboutPage = (props) => {
    const menuItems = [
        {
            translationKey: 'initialSettingsPage.aboutPage.appDownloadLinks',
            icon: Link,
            action: () => {
                Navigation.navigate(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS);
            },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.viewTheCode',
            icon: Eye,
            iconRight: NewWindow,
            action: () => {
                openExternalLink(CONST.GITHUB_URL);
            },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.viewOpenJobs',
            icon: MoneyBag,
            iconRight: NewWindow,
            action: () => {
                openExternalLink(CONST.UPWORK_URL);
            },
        },
        {
            translationKey: 'initialSettingsPage.aboutPage.reportABug',
            icon: Bug,
            action: navigateToConciergeChat,
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
                            <Text
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
                            </Text>
                            <Text style={[styles.baseFontStyle, styles.mv5]}>
                                {props.translate('initialSettingsPage.aboutPage.description')}
                            </Text>
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
                    <Text
                        style={[styles.chatItemMessageHeaderTimestamp]}
                        numberOfLines={1}
                    >
                        {props.translate(
                            'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase1',
                        )}
                        {' '}
                        <Text
                            style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                            onPress={() => openExternalLink(CONST.TERMS_URL)}
                        >
                            {props.translate(
                                'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase2',
                            )}
                        </Text>
                        {' '}
                        {props.translate(
                            'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase3',
                        )}
                        {' '}
                        <Text
                            style={[styles.chatItemMessageHeaderTimestamp, styles.link]}
                            onPress={() => openExternalLink(CONST.PRIVACY_URL)}
                        >
                            {props.translate(
                                'initialSettingsPage.readTheTermsAndPrivacyPolicy.phrase4',
                            )}
                        </Text>
                        .
                    </Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

AboutPage.propTypes = propTypes;
AboutPage.displayName = 'AboutPage';

export default withLocalize(AboutPage);
