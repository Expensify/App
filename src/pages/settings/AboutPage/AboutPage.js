import _ from 'underscore';
import React from 'react';
import {View, ScrollView} from 'react-native';
import Lottie from 'lottie-react-native';
import LoadingAnimation from '../../../../assets/lottie/Loading.json';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import Navigation from '../../../libs/Navigation/Navigation';
import ROUTES from '../../../ROUTES';
import styles from '../../../styles/styles';
import Text from '../../../components/Text';
import TextLink from '../../../components/TextLink';
import CONST from '../../../CONST';
import * as Expensicons from '../../../components/Icon/Expensicons';
import ScreenWrapper from '../../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import MenuItem from '../../../components/MenuItem';
import Logo from '../../../../assets/images/new-expensify.svg';
import pkg from '../../../../package.json';
import * as Report from '../../../libs/actions/Report';
import * as Link from '../../../libs/actions/Link';
import getPlatformSpecificMenuItems from './getPlatformSpecificMenuItems';
import compose from '../../../libs/compose';

const propTypes = {
    ...withLocalizePropTypes,
    ...windowDimensionsPropTypes,
};

const AboutPage = (props) => {
    const platformSpecificMenuItems = getPlatformSpecificMenuItems(props.isSmallScreenWidth);

    const menuItems = [
        {
            translationKey: 'initialSettingsPage.aboutPage.appDownloadLinks',
            icon: Expensicons.Link,
            action: () => {
                Navigation.navigate(ROUTES.SETTINGS_APP_DOWNLOAD_LINKS);
            },
        },
        ...platformSpecificMenuItems,
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
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
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
                            <Lottie
                                source={LoadingAnimation}
                                autoPlay
                                loop
                                style={{width: 80, height: 80}}
                            />
                            {/*<Logo height={80} width={80} />*/}
                            <Text
                                selectable
                                style={[
                                    styles.textLabel,
                                    styles.alignSelfCenter,
                                    styles.mt6,
                                    styles.mb2,
                                    styles.colorMuted,
                                ]}
                            >
                                v
                                {pkg.version}
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
                            'initialSettingsPage.readTheTermsAndPrivacy.phrase1',
                        )}
                        {' '}
                        <TextLink style={[styles.textMicroSupporting, styles.link]} href={CONST.TERMS_URL}>
                            {props.translate(
                                'initialSettingsPage.readTheTermsAndPrivacy.phrase2',
                            )}
                        </TextLink>
                        {' '}
                        {props.translate(
                            'initialSettingsPage.readTheTermsAndPrivacy.phrase3',
                        )}
                        {' '}
                        <TextLink style={[styles.textMicroSupporting, styles.link]} href={CONST.PRIVACY_URL}>
                            {props.translate(
                                'initialSettingsPage.readTheTermsAndPrivacy.phrase4',
                            )}
                        </TextLink>
                        .
                    </Text>
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
};

AboutPage.propTypes = propTypes;
AboutPage.displayName = 'AboutPage';

export default compose(
    withLocalize,
    withWindowDimensions,
)(AboutPage);
