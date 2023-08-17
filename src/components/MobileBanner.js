import React, {useState} from 'react';
import {View} from 'react-native';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';
import Tooltip from './Tooltip';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import CONST from '../CONST';
import AppIcon from '../../../assets/images/expensify-app-icon.svg';
import Button from './Button';
import variables from '../styles/variables';
import useLocalize from '../hooks/useLocalize';
import * as Link from '../libs/actions/Link';
import * as Browser from '../libs/Browser';
import getOperatingSystem from '../libs/getOperatingSystem';

function MobileBanner() {
    const [shouldShowBanner, setshouldShowBanner] = useState(Browser.isMobile());
    const {translate} = useLocalize();

    const handleCloseBanner = () => {
        setshouldShowBanner(false);
    };

    let link = '';

    if (getOperatingSystem() === CONST.OS.IOS) {
        link = CONST.APP_DOWNLOAD_LINKS.IOS;
    } else if (getOperatingSystem() === CONST.OS.ANDROID) {
        link = CONST.APP_DOWNLOAD_LINKS.ANDROID;
    }

    const handleOpenAppStore = () => {
        Link.openExternalLink(link, true);
    };

    return (
        shouldShowBanner && (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.pv4, styles.ph5, styles.gap4, styles.activeComponentBG, styles.mw100]}>
                <View style={[styles.flex1, styles.flexRow, styles.flexGrow1, styles.alignItemsCenter]}>
                    <View style={[styles.alignItemsCenter, styles.gap3, styles.flexRow, styles.flex1]}>
                        <Icon
                            src={AppIcon}
                            width={variables.mobileBannerAppIconSize}
                            height={variables.mobileBannerAppIconSize}
                            additionalStyles={[styles.appIconBorderRadius]}
                        />
                        <View style={[styles.flexColumn, styles.justifyContentCenter, styles.alignItemsStart, styles.flex1]}>
                            <Text
                                style={[styles.alignSelfStretch, styles.textLabel, styles.textStrong]}
                                suppressHighlighting
                            >
                                {'Download the app'}
                            </Text>
                            <Text
                                style={[styles.alignSelfStretch, styles.textLabel]}
                                suppressHighlighting
                            >
                                {'Keep the conversation going in New Expensify.'}
                            </Text>
                        </View>
                    </View>
                </View>
                <Button
                    small
                    success
                    text="Download"
                    onPress={handleOpenAppStore}
                />
                <Tooltip text={translate('common.close')}>
                    <PressableWithFeedback
                        onPress={handleCloseBanner}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={translate('common.close')}
                    >
                        <Icon src={Expensicons.Close} />
                    </PressableWithFeedback>
                </Tooltip>
            </View>
        )
    );
}

MobileBanner.displayName = 'MobileBanner';

export default MobileBanner;
