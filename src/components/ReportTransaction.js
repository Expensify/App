import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import styles from '../styles/styles';
import * as IOU from '../libs/actions/IOU';
import * as ReportActions from '../libs/actions/ReportActions';
import reportActionPropTypes from '../pages/home/report/reportActionPropTypes';
import ReportActionItemSingle from '../pages/home/report/ReportActionItemSingle';
import withLocalize, {withLocalizePropTypes} from './withLocalize';
import OfflineWithFeedback from './OfflineWithFeedback';
import Text from './Text';
import Button from './Button';

const propTypes = {
    /** The chatReport which the transaction is associated with */
    /* eslint-disable-next-line react/no-unused-prop-types */
    chatReportID: PropTypes.string.isRequired,

    /** ID for the IOU report */
    /* eslint-disable-next-line react/no-unused-prop-types */
    iouReportID: PropTypes.string.isRequired,

    /** The report action which we are displaying */
    action: PropTypes.shape(reportActionPropTypes).isRequired,

    /** Can this transaction be deleted? */
    canBeDeleted: PropTypes.bool,

    /** Indicates whether pressing the delete button should hide the details sidebar */
    shouldCloseOnDelete: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    canBeDeleted: false,
    shouldCloseOnDelete: false,
};

class ReportTransaction extends Component {
    constructor(props) {
        super(props);

        this.deleteMoneyRequest = this.deleteMoneyRequest.bind(this);
    }

    deleteMoneyRequest() {
        IOU.deleteMoneyRequest(this.props.chatReportID, this.props.iouReportID, this.props.action, this.props.shouldCloseOnDelete);
    }

    render() {
        return (
            <OfflineWithFeedback
                onClose={() => ReportActions.clearReportActionErrors(this.props.chatReportID, this.props.action)}
                pendingAction={this.props.action.pendingAction}
                errors={this.props.action.errors}
                errorRowStyles={[styles.ml10, styles.mr2]}
            >
                <View styles={[styles.mb5]}>
                    <ReportActionItemSingle
                        action={this.props.action}
                        wrapperStyles={[styles.reportTransactionWrapper]}
                    >
                        <Text style={[styles.chatItemMessage]}>{this.props.action.message[0].text}</Text>
                    </ReportActionItemSingle>
                    {this.props.canBeDeleted && (
                        <View style={[styles.flexRow, styles.justifyContentStart]}>
                            <Button
                                small
                                text={this.props.translate('common.delete')}
                                style={[styles.mb3, styles.chatItemComposeSecondaryRowOffset]}
                                onPress={this.deleteMoneyRequest}
                            />
                        </View>
                    )}
                </View>
            </OfflineWithFeedback>
        );
    }
}

ReportTransaction.defaultProps = defaultProps;
ReportTransaction.propTypes = propTypes;
export default withLocalize(ReportTransaction);
