import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';
import CaretWrapper from './CaretWrapper';
import Icon from './Icon';
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

    /** Children components */
    children?: React.ReactNode;
};

function FeedSelector({onFeedSelect, cardIcon, shouldChangeLayout, feedName, supportingText, children}: Props) {
    const styles = useThemeStyles();

    return (
        <PressableWithFeedback
            onPress={onFeedSelect}
            style={[styles.flexRow, styles.alignItemsCenter, styles.gap3, shouldChangeLayout && styles.mb3]}
            accessibilityLabel={feedName ?? ''}
        >
            <Icon
                src={cardIcon}
                height={variables.cardIconHeight}
                width={variables.cardIconWidth}
                additionalStyles={styles.cardIcon}
            />
            <View style={styles.flex1}>
                <View style={[styles.flexRow, styles.gap1]}>
                    <CaretWrapper style={styles.flex1}>
                        <Text style={[styles.textStrong, styles.flexShrink1]}>{feedName}</Text>
                    </CaretWrapper>
                    {children}
                </View>
                <Text style={styles.textLabelSupporting}>{supportingText}</Text>
            </View>
        </PressableWithFeedback>
    );
}

export default FeedSelector;
