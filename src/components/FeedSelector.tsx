import React from 'react';
import {View} from 'react-native';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';
import CaretWrapper from './CaretWrapper';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import * as Illustrations from './Icon/Illustrations';
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

    return (
        <PressableWithFeedback
            onPress={onFeedSelect}
            style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, shouldChangeLayout && styles.mb3]}
            accessibilityLabel={feedName ?? ''}
        >
            {plaidUrl ? (
                <View>
                    <Image
                        source={{uri: plaidUrl}}
                        style={styles.plaidIconSmall}
                        cachePolicy="memory-disk"
                    />
                    <Icon
                        src={Illustrations.PlaidCompanyCardDetail}
                        height={variables.cardIconHeight}
                        width={variables.cardIconWidth}
                    />
                </View>
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
