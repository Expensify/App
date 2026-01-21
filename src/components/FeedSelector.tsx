import React from 'react';
import {View} from 'react-native';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import CaretWrapper from './CaretWrapper';
import Icon from './Icon';
import {PressableWithFeedback} from './Pressable';
import SearchInputSelectionSkeleton from './Skeletons/SearchInputSelectionSkeleton';
import Text from './Text';

type Props = {
    /** Function to call when the feed is selected */
    onFeedSelect: () => void;

    /** Icon for the card */
    CardFeedIcon: React.ReactNode;

    /** Feed name */
    feedName?: string;

    /** Supporting text */
    supportingText?: string;

    /** Whether the RBR indicator should be shown */
    shouldShowRBR?: boolean;

    /** Whether the feed selector should render a loading skeleton */
    isLoading?: boolean;
};

function FeedSelector({onFeedSelect, CardFeedIcon, feedName, supportingText, shouldShowRBR = false, isLoading = false}: Props) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator'] as const);

    if (isLoading) {
        return <SearchInputSelectionSkeleton />;
    }

    return (
        <PressableWithFeedback
            onPress={onFeedSelect}
            wrapperStyle={styles.flexShrink1}
            style={[styles.flexRow, styles.alignItemsCenter, styles.gap3]}
            accessibilityLabel={feedName ?? ''}
        >
            {CardFeedIcon}

            <View style={styles.flex1}>
                <View style={[styles.flexRow, styles.gap1, styles.alignItemsCenter]}>
                    <CaretWrapper>
                        <Text
                            numberOfLines={1}
                            style={[styles.textStrong, styles.flexShrink1]}
                        >
                            {feedName}
                        </Text>
                    </CaretWrapper>
                    {shouldShowRBR && (
                        <Icon
                            src={expensifyIcons.DotIndicator}
                            fill={theme.danger}
                        />
                    )}
                </View>
                <Text
                    numberOfLines={1}
                    style={styles.textLabelSupporting}
                >
                    {supportingText}
                </Text>
            </View>
        </PressableWithFeedback>
    );
}

export default FeedSelector;
