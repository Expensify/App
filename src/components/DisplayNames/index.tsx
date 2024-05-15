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

type CaretWrapperProps = {
    children: React.ReactNode;
    shouldShowCaret?: boolean;
};

function CaretWrapper({children, shouldShowCaret}: CaretWrapperProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    if (!shouldShowCaret) {
        return children;
    }

    return (
        <View style={[styles.flex1, styles.flexRow, styles.gap1, styles.alignItemsCenter]}>
            {children}
            <Icon
                src={Expensicons.DownArrow}
                fill={theme.icon}
                width={variables.iconSizeExtraSmall}
                height={variables.iconSizeExtraSmall}
            />
        </View>
    );
}

function DisplayNames({fullTitle, tooltipEnabled, textStyles, numberOfLines, shouldUseFullTitle, displayNamesWithTooltips, renderAdditionalText, shouldShowCaret}: DisplayNamesProps) {
    const {translate} = useLocalize();
    const title = fullTitle || translate('common.hidden');

    if (!tooltipEnabled) {
        return (
            <CaretWrapper shouldShowCaret={shouldShowCaret}>
                <DisplayNamesWithoutTooltip
                    textStyles={textStyles}
                    numberOfLines={numberOfLines}
                    fullTitle={title}
                    renderAdditionalText={renderAdditionalText}
                />
            </CaretWrapper>
        );
    }

    if (shouldUseFullTitle) {
        return (
            <CaretWrapper shouldShowCaret={shouldShowCaret}>
                <DisplayNamesWithToolTip
                    shouldUseFullTitle
                    fullTitle={title}
                    textStyles={textStyles}
                    numberOfLines={numberOfLines}
                    renderAdditionalText={renderAdditionalText}
                />
            </CaretWrapper>
        );
    }

    return (
        <CaretWrapper shouldShowCaret={shouldShowCaret}>
            <DisplayNamesWithToolTip
                fullTitle={title}
                displayNamesWithTooltips={displayNamesWithTooltips}
                textStyles={textStyles}
                numberOfLines={numberOfLines}
                renderAdditionalText={renderAdditionalText}
            />
        </CaretWrapper>
    );
}

DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
