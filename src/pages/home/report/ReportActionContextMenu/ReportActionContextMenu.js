import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import CONTEXT_ACTIONS from './CONTEXT_ACTIONS';
import getReportActionContextMenuStyles from '../../../../styles/getReportActionContextMenuStyles';
import ReportActionContextMenuItem from './ReportActionContextMenuItem';

const propTypes = {
    // The ID of the report this report action is attached to.
    // eslint-disable-next-line react/no-unused-prop-types
    reportID: PropTypes.number.isRequired,

    // The ID of the report action this context menu is attached to.
    // eslint-disable-next-line react/no-unused-prop-types
    reportActionID: PropTypes.number.isRequired,

    // If true, this component will be a small, row-oriented menu that displays icons but not text.
    // If false, this component will be a larger, column-oriented menu that displays icons alongside text in each row.
    isMini: PropTypes.bool,

    // Controls the visibility of this component.
    isVisible: PropTypes.bool,
};

const defaultProps = {
    isMini: false,
    isVisible: false,
};

const ReportActionContextMenu = (props) => {
    const wrapperStyle = getReportActionContextMenuStyles(props.isMini);
    return props.isVisible && (
        <View style={wrapperStyle}>
            {CONTEXT_ACTIONS.map(contextAction => (
                <ReportActionContextMenuItem
                    icon={contextAction.icon}
                    text={contextAction.text}
                    isMini={props.isMini}
                    key={contextAction.text}
                />
            ))}
        </View>
    );
};

ReportActionContextMenu.propTypes = propTypes;
ReportActionContextMenu.defaultProps = defaultProps;

export default ReportActionContextMenu;
