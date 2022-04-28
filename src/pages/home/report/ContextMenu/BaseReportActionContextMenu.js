import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import PropTypes from 'prop-types';
import getReportActionContextMenuStyles from '../../../../styles/getReportActionContextMenuStyles';
import ContextMenuItem from '../../../../components/ContextMenuItem';
import {
    propTypes as genericReportActionContextMenuPropTypes,
    defaultProps as GenericReportActionContextMenuDefaultProps,
} from './genericReportActionContextMenuPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ContextMenuActions, {CONTEXT_MENU_TYPES} from './ContextMenuActions';

const propTypes = {
    /** String representing the context menu type [LINK, REPORT_ACTION] which controls context menu choices  */
    type: PropTypes.string,

    /** A description text to show under the title */
    description: PropTypes.string,
    ...genericReportActionContextMenuPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    type: CONTEXT_MENU_TYPES.REPORT_ACTION,
    ...GenericReportActionContextMenuDefaultProps,
};
class BaseReportActionContextMenu extends React.Component {
    constructor(props) {
        super(props);
        this.wrapperStyle = getReportActionContextMenuStyles(this.props.isMini);
    }

    render() {
        const shouldShowFilter = contextAction => contextAction.shouldShow(this.props.type, this.props.reportAction);

        return this.props.isVisible && (
            <View style={this.wrapperStyle}>
                {_.map(_.filter(ContextMenuActions, shouldShowFilter), contextAction => (
                    <ContextMenuItem
                        icon={contextAction.icon}
                        text={this.props.translate(contextAction.textTranslateKey)}
                        successIcon={contextAction.successIcon}
                        successText={contextAction.successTextTranslateKey
                            ? this.props.translate(contextAction.successTextTranslateKey)
                            : undefined}
                        isMini={this.props.isMini}
                        key={contextAction.textTranslateKey}
                        onPress={() => contextAction.onPress(!this.props.isMini, {
                            reportAction: this.props.reportAction,
                            reportID: this.props.reportID,
                            draftMessage: this.props.draftMessage,
                            selection: this.props.selection,
                        })}
                        description={this.props.description}
                    />
                ))}
            </View>
        );
    }
}

BaseReportActionContextMenu.propTypes = propTypes;
BaseReportActionContextMenu.defaultProps = defaultProps;

export default withLocalize(BaseReportActionContextMenu);
