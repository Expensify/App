import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import {
    propTypes as ReportActionContextMenuPropsTypes,
    defaultProps as ReportActionContextMenuDefaultProps,
} from '../ReportActionContextMenuPropsTypes';
import withLocalize from '../../../../../components/withLocalize';
import {getMiniReportActionContextMenuWrapperStyle} from '../../../../../styles/getReportActionItemStyles';
import ReportActionContextMenu from '../ReportActionContextMenu';

const propTypes = {
    ..._.omit(ReportActionContextMenuPropsTypes, ['isMini']),

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: PropTypes.bool,
};

const defaultProps = {
    ..._.omit(ReportActionContextMenuDefaultProps, ['isMini']),
    displayAsGroup: false,
};

const MiniReportActionContextMenu = props => (
    <View style={getMiniReportActionContextMenuWrapperStyle(props.displayAsGroup)}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <ReportActionContextMenu isMini {...props} />
    </View>
);

MiniReportActionContextMenu.propTypes = propTypes;
MiniReportActionContextMenu.defaultProps = defaultProps;

export default withLocalize(MiniReportActionContextMenu);
