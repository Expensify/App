import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import StringUtils from '@libs/StringUtils';

type DisplayNamesWithoutTooltipProps = {
    /** The full title of the DisplayNames component (not split up) */
    fullTitle?: string;

    /** Arbitrary styles of the displayName text */
    textStyles?: StyleProp<TextStyle>;

    /** Number of lines before wrapping */
    numberOfLines?: number;

    /** Additional Text component to render after the displayNames */
    renderAdditionalText?: () => React.ReactNode;
};

function DisplayNamesWithoutTooltip({textStyles = [], numberOfLines = 1, fullTitle = '', renderAdditionalText}: DisplayNamesWithoutTooltipProps) {
    const styles = useThemeStyles();
    const title = StringUtils.containsHtml(fullTitle) ? <RenderHTML html={fullTitle} /> : fullTitle;

    return (
        <Text
            style={[textStyles, numberOfLines === 1 ? styles.pre : styles.preWrap]}
            numberOfLines={numberOfLines}
        >
            {title}
            {renderAdditionalText?.()}
        </Text>
    );
}

DisplayNamesWithoutTooltip.displayName = 'DisplayNamesWithoutTooltip';

export default DisplayNamesWithoutTooltip;
