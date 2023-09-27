import React from 'react';
import {propTypes, defaultProps} from './displayNamesPropTypes';
import Text from '../Text';
import RenderHTML from '../RenderHTML';
import * as StringUtils from '../../libs/StringUtils';
import * as StyleUtils from "../../styles/StyleUtils";

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
function DisplayNames(props) {
    const containsHtml = StringUtils.containsHtml(props.fullTitle);
    const fullTitle = containsHtml ? <RenderHTML html={props.fullTitle} /> : props.fullTitle;

    return (
        <Text
            accessibilityLabel={props.accessibilityLabel}
            // Set a fixed height to prevent RenderHTML's text overflow on iOS
            style={[containsHtml? StyleUtils.getHeightOfRenderHtmlText(props.numberOfLines) : {}, ...props.textStyles]}
            numberOfLines={props.numberOfLines || undefined}
        >
            {fullTitle}
        </Text>
    );
}

DisplayNames.propTypes = propTypes;
DisplayNames.defaultProps = defaultProps;
DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
