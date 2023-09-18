import React from 'react';
import {propTypes, defaultProps} from './displayNamesPropTypes';
import Text from '../Text';
import RenderHTML from '../RenderHTML';
import * as ReportUtils from '../../libs/ReportUtils';

// As we don't have to show tooltips of the Native platform so we simply render the full display names list.
function DisplayNames(props) {
    let fullTitleHtml = ReportUtils.getReportName(props.report, undefined, true);
    fullTitleHtml = ReportUtils.containsHtml(fullTitleHtml) ? fullTitleHtml : '';

    const fullTitle = fullTitleHtml ? <RenderHTML html={fullTitleHtml} /> : props.fullTitle;

    return (
        <Text
            accessibilityLabel={props.accessibilityLabel}
            style={props.textStyles}
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
