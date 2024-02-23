import React from 'react';
import type {ViewStyle} from 'react-native';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import StringUtils from '@libs/StringUtils';
import type DisplayNamesProps from './types';

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
function DisplayNames({accessibilityLabel, fullTitle, textStyles = [], numberOfLines = 1, renderAdditionalText}: DisplayNamesProps) {
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    const containsHtml = StringUtils.containsHtml(fullTitle);
    if (containsHtml) {
        return (
            <View style={[textStyles as ViewStyle, StyleUtils.getHeightOfRenderHtmlText(numberOfLines)]}>
                <RenderHTML html={fullTitle} />
            </View>
        );
    }

    return (
        <Text
            accessibilityLabel={accessibilityLabel}
            style={textStyles}
            numberOfLines={numberOfLines}
        >
            {fullTitle || translate('common.hidden')}
            {renderAdditionalText?.()}
        </Text>
    );
}

DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
