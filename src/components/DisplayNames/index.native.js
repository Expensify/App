import React from 'react';
import {View} from 'react-native';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import * as StringUtils from '@libs/StringUtils';
import * as StyleUtils from '@styles/StyleUtils';
import {defaultProps, propTypes} from './displayNamesPropTypes';

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
function DisplayNames(props) {
    const containsHtml = StringUtils.containsHtml(props.fullTitle);

    if (containsHtml) {
        return (
            <View style={[...props.textStyles, StyleUtils.getHeightOfRenderHtmlText(props.numberOfLines)]}>
                <RenderHTML html={props.fullTitle} />
            </View>
        );
    }

    return (
        <Text
            accessibilityLabel={props.accessibilityLabel}
            style={props.textStyles}
            numberOfLines={props.numberOfLines || undefined}
        >
            {props.fullTitle}
        </Text>
    );
}

DisplayNames.propTypes = propTypes;
DisplayNames.defaultProps = defaultProps;
DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
