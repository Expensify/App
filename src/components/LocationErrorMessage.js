import PropTypes from 'prop-types';
import React from 'react';
import {Linking, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Text from './Text';
import TextLink from './TextLink';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import compose from '../libs/compose';
import getPlatform from '../libs/getPlatform';
import colors from '../styles/colors';
import styles from '../styles/styles';

const propTypes = {
    /** The location error code from onyx */
    locationErrorCode: PropTypes.number,

    ...withLocalizePropTypes,
};

const defaultProps = {
    // when its 0, we assume no error
    locationErrorCode: 0,
};

function LocationErrorMessage({locationErrorCode, translate}) {
    if (!locationErrorCode) {
        return null;
    }

    const navigateToSettings = () => {
        const platform = getPlatform();
        if (platform === CONST.PLATFORM.IOS || platform === CONST.PLATFORM.ANDROID) {
            Linking.openSettings();
        } else {
            Linking.openURL(CONST.NEWHELP_URL);
        }
    };

    return (
        <View style={[styles.dotIndicatorMessage, styles.mt4]}>
            <View style={styles.offlineFeedback.errorDot}>
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={colors.red}
                />
            </View>
            <View style={styles.offlineFeedback.textContainer}>
                {/* 
                  Show appropriate error msg on location issues
                  - errorCode = -1 -> location not supported (web only)
                  - errorCode = 1 -> location permission is not enabled
                  - errorCode = 2 -> location is unavailable or there is some connection issue
                  - errorCode = 3 -> location fetch timeout  
                */}
                {locationErrorCode === 1 ? (
                    <Text style={styles.offlineFeedback.text}>
                        <Text>{`${translate('location.permissionDenied')} ${translate('common.please')}`}</Text>
                        <TextLink onPress={navigateToSettings}>{` ${translate('location.allowPermission')} `}</TextLink>
                        <Text>{translate('location.tryAgain')}</Text>
                    </Text>
                ) : (
                    <Text style={styles.offlineFeedback.text}>{translate('location.notFound')}</Text>
                )}
            </View>
        </View>
    );
}

LocationErrorMessage.displayName = 'LocationErrorMessage';
LocationErrorMessage.propTypes = propTypes;
LocationErrorMessage.defaultProps = defaultProps;
export default compose(
    withOnyx({
        locationErrorCode: {
            key: ONYXKEYS.LOCATION_ERROR_CODE,
        },
    }),
    withLocalize,
)(LocationErrorMessage);
