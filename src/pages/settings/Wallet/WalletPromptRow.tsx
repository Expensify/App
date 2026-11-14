import Button from '@components/Button';
import Icon from '@components/Icon';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

type WalletPromptRowProps = {
    /** What the user needs to do, shown next to the green dot */
    message: string;

    /** Whether the message is shown in green, like the dot, instead of the muted label color */
    shouldShowSuccessMessage?: boolean;

    /** Text of the button that takes the user to act on the prompt, the button is hidden without it */
    buttonText?: string;

    onButtonPress?: () => void;

    buttonSentryLabel?: SentryLabel;

    /** Spacing for the row, which follows the surface it sits in */
    style?: StyleProp<ViewStyle>;
};

/**
 * The green dot, message and small button shown under a Wallet list item that needs the user's attention.
 * Every such prompt renders through this row so they all read as the same kind of prompt.
 */
function WalletPromptRow({message, shouldShowSuccessMessage = true, buttonText, onButtonPress, buttonSentryLabel, style}: WalletPromptRowProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, style]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1, styles.mr2]}>
                <Icon
                    src={icons.DotIndicator}
                    fill={theme.success}
                    additionalStyles={[styles.mr2]}
                />
                <Text style={[styles.mutedNormalTextLabel, styles.label, shouldShowSuccessMessage && styles.textSuccess, styles.flexShrink1]}>{message}</Text>
            </View>
            {!!buttonText && !!onButtonPress && (
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    onPress={onButtonPress}
                    sentryLabel={buttonSentryLabel}
                >
                    <Button.Text>{buttonText}</Button.Text>
                </Button>
            )}
        </View>
    );
}

export default WalletPromptRow;
