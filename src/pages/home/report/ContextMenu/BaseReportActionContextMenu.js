import React from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import getReportActionContextMenuStyles from '../../../../styles/getReportActionContextMenuStyles';
import ContextMenuItem from '../../../../components/ContextMenuItem';
import {
    propTypes as GenericReportActionContextMenuPropTypes,
    defaultProps,
} from './GenericReportActionContextMenuPropTypes';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import ContextMenuActions from './ContextMenuActions';

const propTypes = {
    ...GenericReportActionContextMenuPropTypes,
    ...withLocalizePropTypes,
};

class BaseReportActionContextMenu extends React.Component {
    constructor(props) {
        super(props);

        this.wrapperStyle = getReportActionContextMenuStyles(this.props.isMini);
    }

    render() {
        return this.props.isVisible && (
            <View style={this.wrapperStyle}>
                {_.map(ContextMenuActions, contextAction => contextAction.shouldShow(this.props.reportAction) && (
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
                    />
                ))}
            </View>
        );
    }
}

BaseReportActionContextMenu.propTypes = propTypes;
BaseReportActionContextMenu.defaultProps = defaultProps;

export default withLocalize(BaseReportActionContextMenu);
