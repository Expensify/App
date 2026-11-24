import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useConfirmModal from '@hooks/useConfirmModal';
import useIsConnectionBlockedByCertificatePinning from '@hooks/useIsConnectionBlockedByCertificatePinning';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import Icon from './Icon';
import Text from './Text';
import TextLink from './TextLink';

type OfflineIndicatorProps = {
    /** Optional styles for container element that will override the default styling for the offline indicator */
    containerStyles?: StyleProp<ViewStyle>;

    /** Optional styles for the container */
    style?: StyleProp<ViewStyle>;

    /** Whether to add bottom safe area padding to the view. */
    addBottomSafeAreaPadding?: boolean;
};

function OfflineIndicator({style, containerStyles: containerStylesProp, addBottomSafeAreaPadding = false}: OfflineIndicatorProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const isConnectionBlockedByCertificatePinning = useIsConnectionBlockedByCertificatePinning();
    const {showConfirmModal} = useConfirmModal();
    const icons = useMemoizedLazyExpensifyIcons(['OfflineCloud']);

    const fallbackStyle = [styles.offlineIndicatorContainer, containerStylesProp];
    const containerStyles = useBottomSafeSafeAreaPaddingStyle({
        addBottomSafeAreaPadding,
        addOfflineIndicatorBottomSafeAreaPadding: false,
        style: fallbackStyle,
    });

    if (!isOffline) {
        return null;
    }

    // The indicator has a fixed height, so the recovery steps open in a modal instead of wrapping here.
    const showCertificatePinningModal = () => {
        showConfirmModal({
            title: translate('common.cantConnectSecurely'),
            prompt: translate('common.cantConnectSecurelyPrompt'),
            confirmText: translate('common.buttonConfirm'),
            shouldShowCancelButton: false,
        });
    };

    return (
        <View style={[containerStyles, styles.flexRow, styles.alignItemsCenter, style]}>
            <Icon
                fill={theme.icon}
                src={icons.OfflineCloud}
                width={variables.iconSizeSmall}
                height={variables.iconSizeSmall}
            />
            {isConnectionBlockedByCertificatePinning ? (
                <>
                    {/* The row has a fixed height, so the message gives way and the link stays visible in every language. */}
                    <Text
                        style={[styles.ml3, styles.flexShrink1, styles.chatItemComposeSecondaryRowSubText]}
                        numberOfLines={1}
                    >
                        {translate('common.cantConnectSecurely')}
                    </Text>
                    <TextLink
                        style={styles.ml1}
                        variant="micro"
                        onPress={showCertificatePinningModal}
                        sentryLabel={CONST.SENTRY_LABEL.OFFLINE_INDICATOR.CERTIFICATE_PINNING_LEARN_MORE}
                    >
                        {translate('common.learnMore')}
                    </TextLink>
                </>
            ) : (
                <Text style={[styles.ml3, styles.chatItemComposeSecondaryRowSubText]}>{translate('common.youAppearToBeOffline')}</Text>
            )}
        </View>
    );
}

export default OfflineIndicator;
