import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import colors from '../../styles/colors';
import styles from '../../styles/styles';
import Icon from '../Icon';
import * as Expensicons from '../Icon/Expensicons';
import Text from '../Text';
import TextLink from '../TextLink';
import withLocalize from '../withLocalize';
import Tooltip from '../Tooltip';
import PressableWithoutFeedback from '../Pressable/PressableWithoutFeedback';
import CONST from '../../CONST';
import * as locationErrorMessagePropTypes from './locationErrorMessagePropTypes';
import {withLocalizePropTypes} from '../withLocalize';

const propTypes = {
    /** A callback that runs when 'allow location permission' link is pressed */
    onAllowLocationLinkPress: PropTypes.func.isRequired,

    ...locationErrorMessagePropTypes.propTypes,

    /* Onyx Props */
    ...withLocalizePropTypes,
};

function BaseLocationErrorMessage({onClose, onAllowLocationLinkPress, locationErrorCode, translate}) {
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
                            style={styles.locationErrorLinkText}
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
                        onPress={onClose}
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
BaseLocationErrorMessage.defaultProps = locationErrorMessagePropTypes.defaultProps;
export default withLocalize(BaseLocationErrorMessage);
