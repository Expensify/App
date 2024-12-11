import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';

type EducationalTooltipContentProps = {
    /** The text to display in the tooltip */
    content: Array<{text: TranslationPaths; isBold: boolean}>;
};

function EducationalTooltipContent({content}: EducationalTooltipContentProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    return (
        <View style={[styles.alignItemsCenter, styles.flexRow, styles.justifyContentCenter, styles.flexWrap, styles.textAlignCenter, styles.gap1, styles.p2]}>
            <Icon
                src={Expensicons.Lightbulb}
                fill={theme.tooltipHighlightText}
                medium
            />
            <Text style={[styles.quickActionTooltipSubtitle]}>
                {content.map(({text, isBold}) => (
                    <Text
                        key={text}
                        style={[styles.quickActionTooltipSubtitle, isBold && styles.textBold]}
                    >
                        {translate(text)}
                    </Text>
                ))}
            </Text>
        </View>
    );
}

export default EducationalTooltipContent;
