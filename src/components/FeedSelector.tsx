import React from 'react';
import {View} from 'react-native';
import type {ImageStyle, StyleProp} from 'react-native';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import CaretWrapper from './CaretWrapper';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import Image from './Image';
import {PressableWithFeedback} from './Pressable';
import Text from './Text';

type Props = {
    /** Function to call when the feed is selected */
    onFeedSelect: () => void;

    /** Icon for the card */
    cardIcon: IconAsset;

    /** Whether to show assign card button */
    shouldChangeLayout?: boolean;

    /** Feed name */
    feedName?: string;

    /** Supporting text */
    supportingText?: string;

    /** Whether the RBR indicator should be shown */
    shouldShowRBR?: boolean;

    /** Image url for plaid bank account */
    plaidUrl?: string | null;
};

function FeedSelector({onFeedSelect, cardIcon, shouldChangeLayout, feedName, supportingText, shouldShowRBR = false, plaidUrl = null}: Props) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    const imageStyle: StyleProp<ImageStyle> = [StyleUtils.getAvatarStyle(CONST.AVATAR_SIZE.DEFAULT)];

    return (
        <PressableWithFeedback
            onPress={onFeedSelect}
            style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, shouldChangeLayout && styles.mb3]}
            accessibilityLabel={feedName ?? ''}
        >
            {plaidUrl ? (
                <Image
                    source={{uri: plaidUrl}}
                    style={imageStyle}
                    cachePolicy="memory-disk"
                />
            ) : (
                <Icon
                    src={cardIcon}
                    height={variables.cardIconHeight}
                    width={variables.cardIconWidth}
                    additionalStyles={styles.cardIcon}
                />
            )}
            <View style={styles.flex1}>
                <View style={[styles.flexRow, styles.gap1]}>
                    <CaretWrapper style={styles.flex1}>
                        <Text style={[styles.textStrong, styles.flexShrink1]}>{feedName}</Text>
                    </CaretWrapper>
                    {shouldShowRBR && (
                        <Icon
                            src={Expensicons.DotIndicator}
                            fill={theme.danger}
                        />
                    )}
                </View>
                <Text style={styles.textLabelSupporting}>{supportingText}</Text>
            </View>
        </PressableWithFeedback>
    );
}

export default FeedSelector;
