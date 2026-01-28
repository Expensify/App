import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';
import Icon from './Icon';
import Text from './Text';

type WorkspaceEmptyStateSectionProps = {
    /** The text to display in the title of the section */
    title: string;

    /** The text to display in the subtitle of the section */
    subtitle?: string;

    /** The component to show in the subtitle of the section */
    subtitleComponent?: React.ReactNode;

    /** The icon to display along with the title */
    icon: IconAsset;

    /** Additional style for container */
    containerStyle?: StyleProp<ViewStyle>;

    /** Whether to apply card style to container */
    shouldStyleAsCard?: boolean;
};

function WorkspaceEmptyStateSection({icon, subtitle, title, containerStyle, shouldStyleAsCard = true, subtitleComponent}: WorkspaceEmptyStateSectionProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    return (
        <View
            style={[
                styles.pageWrapper,
                shouldStyleAsCard && styles.cardSectionContainer,
                styles.workspaceSection,
                styles.ph8,
                shouldUseNarrowLayout ? styles.pv10 : styles.pv12,
                containerStyle,
            ]}
        >
            <Icon
                src={icon}
                width={184}
                height={116}
            />

            <View style={[styles.w100, styles.pt5]}>
                <View style={[styles.flexRow, styles.justifyContentCenter, styles.w100, styles.mh1, styles.flexShrink1]}>
                    <Text
                        style={[styles.textHeadline, styles.emptyCardSectionTitle]}
                        accessibilityRole="header"
                    >
                        {title}
                    </Text>
                </View>

                {(!!subtitle || !!subtitleComponent) && (
                    <View style={[styles.flexRow, styles.justifyContentCenter, styles.w100, styles.mt1, styles.mh1]}>
                        {subtitleComponent ?? <Text style={[styles.textNormal, styles.emptyCardSectionSubtitle]}>{subtitle}</Text>}
                    </View>
                )}
            </View>
        </View>
    );
}

export default WorkspaceEmptyStateSection;
