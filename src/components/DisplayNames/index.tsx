import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import DisplayNamesWithoutTooltip from './DisplayNamesWithoutTooltip';
import DisplayNamesWithToolTip from './DisplayNamesWithTooltip';
import type DisplayNamesProps from './types';

function DisplayNames({fullTitle, tooltipEnabled, textStyles, numberOfLines, shouldUseFullTitle, displayNamesWithTooltips, renderAdditionalText, shouldShowCaret}: DisplayNamesProps) {
    const {translate} = useLocalize();
    const title = fullTitle || translate('common.hidden');
    const theme = useTheme();
    const styles = useThemeStyles();

    let result = (
        <DisplayNamesWithToolTip
            fullTitle={title}
            displayNamesWithTooltips={displayNamesWithTooltips}
            textStyles={textStyles}
            numberOfLines={numberOfLines}
            renderAdditionalText={renderAdditionalText}
        />
    );

    if (!tooltipEnabled) {
        result = (
            <DisplayNamesWithoutTooltip
                textStyles={textStyles}
                numberOfLines={numberOfLines}
                fullTitle={title}
                renderAdditionalText={renderAdditionalText}
            />
        );
    }

    if (shouldUseFullTitle) {
        result = (
            <DisplayNamesWithToolTip
                shouldUseFullTitle
                fullTitle={title}
                textStyles={textStyles}
                numberOfLines={numberOfLines}
                renderAdditionalText={renderAdditionalText}
            />
        );
    }

    if (shouldShowCaret) {
        return (
            <View style={[styles.flex1, styles.flexRow, styles.gap1, styles.alignItemsCenter]}>
                {result}
                <Icon
                    src={Expensicons.DownArrow}
                    fill={theme.icon}
                    width={variables.iconSizeExtraSmall}
                    height={variables.iconSizeExtraSmall}
                />
            </View>
        );
    }

    return result;
}

DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
