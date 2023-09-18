import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import compose from '../../libs/compose';
import colors from '../../styles/colors';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Text from '../Text';
import TextLink from '../TextLink';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import Tooltip from '../Tooltip';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import * as User from '../../libs/actions/User';
import CONST from '../../CONST';

const propTypes = {
    /** A callback that runs when 'allow location permission' link is pressed */
    onAllowLocationLinkPress: PropTypes.func.isRequired,

    /* Onyx Props */
    /**
     * The location error code from onyx
     * - code -1 = location not supported (web only)
     * - code 1 = location permission is not enabled
     * - code 2 = location is unavailable or there is some connection issue
     * - code 3 = location fetch timeout
     */
    locationErrorCode: PropTypes.oneOf([-1, 1, 2, 3]),

    ...withLocalizePropTypes,
};

const defaultProps = {
    locationErrorCode: null,
};

function BaseLocationErrorMessage({locationErrorCode, onAllowLocationLinkPress, translate}) {
    if (!locationErrorCode) {
        return null;
    }

    const isPermissionDenied = locationErrorCode === 1;

    return (
        <View style={[styles.dotIndicatorMessage, styles.mt4]}>
            <View style={styles.offlineFeedback.errorDot}>
                <Icon
                    src={Expensicons.DotIndicator}
                    fill={colors.red}
                />
            </View>
            <View style={styles.offlineFeedback.textContainer}>
                {isPermissionDenied ? (
                    <Text>
                        <Text style={[styles.offlineFeedback.text]}>{`${translate('location.permissionDenied')} ${translate('location.please')}`}</Text>
                        <TextLink
                            onPress={onAllowLocationLinkPress}
                            style={[styles.offlineFeedback.text, styles.textBlue]}
                        >
                            {` ${translate('location.allowPermission')} `}
                        </TextLink>
                        <Text style={[styles.offlineFeedback.text]}>{translate('location.tryAgain')}</Text>
                    </Text>
                ) : (
                    <Text style={styles.offlineFeedback.text}>{translate('location.notFound')}</Text>
                )}
            </View>
            <View>
                <Tooltip text={translate('common.close')}>
                    <PressableWithoutFeedback
                        onPress={() => User.clearLocationError()}
                        style={[styles.touchableButtonImage]}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.BUTTON}
                        accessibilityLabel={translate('common.close')}
                    >
                        <Icon src={Expensicons.Close} />
                    </PressableWithoutFeedback>
                </Tooltip>
            </View>
        </View>
    );
}

BaseLocationErrorMessage.displayName = 'BaseLocationErrorMessage';
BaseLocationErrorMessage.propTypes = propTypes;
BaseLocationErrorMessage.defaultProps = defaultProps;
export default compose(
    withOnyx({
        locationErrorCode: {
            key: ONYXKEYS.LOCATION_ERROR_CODE,
            initWithStoredValues: false,
        },
    }),
    withLocalize,
)(BaseLocationErrorMessage);
