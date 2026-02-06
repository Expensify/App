import React from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

type DisplayNamesWithoutTooltipProps = ForwardedFSClassProps & {
    /** The full title of the DisplayNames component (not split up) */
    fullTitle?: string;

    /** Arbitrary styles of the displayName text */
    textStyles?: StyleProp<TextStyle>;

    /** Number of lines before wrapping */
    numberOfLines?: number;

    /** Additional Text component to render after the displayNames */
    renderAdditionalText?: () => React.ReactNode;
};

function DisplayNamesWithoutTooltip({textStyles = [], numberOfLines = 1, fullTitle = '', renderAdditionalText, forwardedFSClass}: DisplayNamesWithoutTooltipProps) {
    const styles = useThemeStyles();
    return (
        <Text
            style={[textStyles, numberOfLines === 1 ? styles.pre : styles.preWrap]}
            numberOfLines={numberOfLines}
            fsClass={forwardedFSClass}
        >
            {fullTitle}
            {renderAdditionalText?.()}
        </Text>
    );
}

export default DisplayNamesWithoutTooltip;
