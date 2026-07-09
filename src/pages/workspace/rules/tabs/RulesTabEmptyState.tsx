import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import ScrollView from '@components/ScrollView';

import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import type {ImageStyle} from 'expo-image';
import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';

type RulesTabEmptyStateProps = {
    illustration: IconAsset;
    headerContentStyles: StyleProp<ViewStyle & ImageStyle>;
    title: string;
    subtitle: string;
    buttonText: string;
    buttonIcon?: IconAsset;
    onPress: () => void;
    isDisabled: boolean;
};

function RulesTabEmptyState({illustration, headerContentStyles, title, subtitle, buttonText, buttonIcon, onPress, isDisabled}: RulesTabEmptyStateProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    return (
        <ScrollView
            style={[styles.flex1, styles.mnh0]}
            contentContainerStyle={[styles.flexGrow1, styles.flexShrink0, styles.justifyContentCenter, styles.w100]}
            addBottomSafeAreaPadding
        >
            <GenericEmptyStateComponent
                headerMedia={illustration}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                headerContentStyles={headerContentStyles}
                title={title}
                subtitle={subtitle}
                subtitleStyles={[styles.textLabel, styles.textSupporting]}
                minModalHeight={0}
                cardContentStyles={styles.ph0}
                containerStyles={[styles.alignItemsCenter, styles.w100, styles.alignSelfCenter, StyleUtils.getMaximumWidth(variables.cardRulesEmptyStateMaxWidth)]}
                buttons={[
                    {
                        buttonText,
                        buttonAction: onPress,
                        success: true,
                        icon: buttonIcon,
                        isDisabled,
                    },
                ]}
            />
        </ScrollView>
    );
}

export default RulesTabEmptyState;
