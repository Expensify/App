import React, {useState} from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import styles from '../styles/styles';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';
import Tooltip from './Tooltip';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import CONST from '../CONST';
import AppIcon from '../../assets/images/expensify-app-icon.svg';
import Button from './Button';
import variables from '../styles/variables';
import useLocalize from '../hooks/useLocalize';
import * as Link from '../libs/actions/Link';
import * as Browser from '../libs/Browser';
import getOperatingSystem from '../libs/getOperatingSystem';
import setShowDownloadAppBanner from '../libs/actions/DownloadAppBanner';

const propTypes = {
    showDownloadAppBanner: PropTypes.bool,
};

const defaultProps = {
    showDownloadAppBanner: true,
};

function MobileBanner({showDownloadAppBanner}) {
    const [shouldShowBanner, setshouldShowBanner] = useState(Browser.isMobile() && showDownloadAppBanner);
    const {translate} = useLocalize();

    const handleCloseBanner = () => {
        setShowDownloadAppBanner(false);
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
                                {translate('mobileBanner.downloadTheApp')}
                            </Text>
                            <Text
                                style={[styles.alignSelfStretch, styles.textLabel, styles.lh16]}
                                suppressHighlighting
                            >
                                {translate('mobileBanner.keepTheConversationGoing')}
                            </Text>
                        </View>
                    </View>
                </View>
                <Button
                    small
                    success
                    text={translate('common.download')}
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
MobileBanner.propTypes = propTypes;
MobileBanner.defaultProps = defaultProps;

export default withOnyx({
    showDownloadAppBanner: {
        key: ONYXKEYS.SHOW_DOWNLOAD_APP_BANNER,
    },
})(MobileBanner);
