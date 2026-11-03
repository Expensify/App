import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {StyleProp, TextStyle, ViewStyle} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import Collapsible from './Collapsible';

type CollapsibleSectionProps = ChildrenProps & {
    title: string;
    titleStyle?: StyleProp<TextStyle>;
    textStyle?: StyleProp<TextStyle>;
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Whether or not to show border between section title and expandable items */
    shouldShowSectionBorder?: boolean;
};

function CollapsibleSection({title, children, titleStyle, textStyle, wrapperStyle, shouldShowSectionBorder}: CollapsibleSectionProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const [isExpanded, setIsExpanded] = useState(false);

    /**
     * Expands/collapses the section
     */
    const toggleSection = () => {
        setIsExpanded(!isExpanded);
    };

    const src = isExpanded ? icons.UpArrow : icons.DownArrow;

    return (
        <View style={[styles.mt4, wrapperStyle]}>
            <PressableWithFeedback
                onPress={toggleSection}
                style={[styles.pb4, styles.flexRow]}
                role={CONST.ROLE.BUTTON}
                accessibilityLabel={title}
                sentryLabel={CONST.SENTRY_LABEL.COLLAPSIBLE_SECTION.TOGGLE}
                hoverDimmingValue={1}
                pressDimmingValue={0.2}
            >
                <Text
                    style={textStyle ?? [styles.flex1, styles.textStrong, styles.userSelectNone, titleStyle]}
                    dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
                    accessibilityRole={CONST.ROLE.HEADER}
                >
                    {title}
                </Text>
                <Icon
                    fill={theme.icon}
                    src={src}
                />
            </PressableWithFeedback>
            {!!shouldShowSectionBorder && <View style={styles.collapsibleSectionBorder} />}
            <Collapsible isOpened={isExpanded}>
                <View>{children}</View>
            </Collapsible>
        </View>
    );
}

export default CollapsibleSection;
