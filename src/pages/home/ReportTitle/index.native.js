// As we don't have to show tooltips of the Native platform so we simply render the option title which wraps.
import React from 'react';
import {Text} from 'react-native';
import {propTypes, defaultProps} from './ReportTitleProps';

const ReportTitle = ({
    style,
    option,
    numberOfLines,
}) => (
    <Text style={style} numberOfLines={numberOfLines}>
        {option.text}
    </Text>
);

ReportTitle.propTypes = propTypes;
ReportTitle.defaultProps = defaultProps;
ReportTitle.displayName = 'ReportTitle';

export default ReportTitle;
