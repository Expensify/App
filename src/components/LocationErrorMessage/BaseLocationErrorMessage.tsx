import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import Tooltip from '@components/Tooltip';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';
import type LocationErrorMessageProps from './types';

type BaseLocationErrorMessageProps = LocationErrorMessageProps & {
    /** A callback that runs when 'allow location permission' link is pressed */
    onAllowLocationLinkPress: () => void;
};

function BaseLocationErrorMessage({onClose, onAllowLocationLinkPress, locationErrorCode}: BaseLocationErrorMessageProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Close'] as const);

    if (!locationErrorCode) {
        return null;
    }

    const isPermissionDenied = locationErrorCode === 1;

    return (
        <View style={[styles.dotIndicatorMessage, styles.mt4]}>
            <View style={styles.offlineFeedbackErrorDot}>
                <Icon
                    src={icons.DotIndicator}
                    fill={colors.red}
                />
            </View>
            <View style={styles.offlineFeedbackTextContainer}>
                {isPermissionDenied ? (
                    <Text>
                        <Text style={[StyleUtils.getDotIndicatorTextStyles()]}>{`${translate('location.permissionDenied')} ${translate('location.please')}`}</Text>
                        <TextLink
                            onPress={onAllowLocationLinkPress}
                            style={styles.locationErrorLinkText}
                        >
                            {` ${translate('location.allowPermission')} `}
                        </TextLink>
                        <Text style={[StyleUtils.getDotIndicatorTextStyles()]}>{translate('location.tryAgain')}</Text>
                    </Text>
                ) : (
                    <Text style={styles.offlineFeedbackText}>{translate('location.notFound')}</Text>
                )}
            </View>
            <View>
                <Tooltip text={translate('common.close')}>
                    <PressableWithoutFeedback
                        onPress={onClose}
                        onMouseDown={(e) => e.preventDefault()}
                        style={[styles.touchableButtonImage]}
                        role={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('common.close')}
                    >
                        <Icon
                            fill={theme.icon}
                            src={icons.Close}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
            </View>
        </View>
    );
}

export default BaseLocationErrorMessage;
