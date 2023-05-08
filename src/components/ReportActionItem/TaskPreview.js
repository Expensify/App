import React from 'react';
import {
    View,
    Pressable,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import compose from '../../libs/compose';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import MultipleAvatars from '../MultipleAvatars';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import * as Report from '../../libs/actions/Report';
import themeColors from '../../styles/themes/default';
import Icon from '../Icon';
import CONST from '../../CONST';
import * as Expensicons from '../Icon/Expensicons';
import Text from '../Text';
import * as PaymentMethods from '../../libs/actions/PaymentMethods';
import OfflineWithFeedback from '../OfflineWithFeedback';
import walletTermsPropTypes from '../../pages/EnablePayments/walletTermsPropTypes';
import ControlSelection from '../../libs/ControlSelection';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';
import reportActionPropTypes from '../../pages/home/report/reportActionPropTypes';
import {showContextMenuForReport} from '../ShowContextMenuContext';
import * as OptionsListUtils from '../../libs/OptionsListUtils';
import Button from '../Button';
import * as CurrencyUtils from '../../libs/CurrencyUtils';
import Checkbox from '../Checkbox';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

const propTypes = {

    /** The ID of the associated taskReport */
    taskReportID: PropTypes.string.isRequired,

    /* Onyx Props */

    /** Active IOU Report for current report */
    taskReport: PropTypes.shape({
        /** Title of the task */
        reportName: PropTypes.string,

        /** Email address of the manager in this iou report */
        managerEmail: PropTypes.string,

        /** Email address of the creator of this iou report */
        ownerEmail: PropTypes.string,
    }),

    /** Whether the task preview is hovered so we can modify its style */
    isHovered: PropTypes.bool,

    ...withLocalizePropTypes,
};

const defaultProps = {
    taskReport: {},
    isHovered: false,
};

const TaskPreview = (props) => {
    const sessionEmail = lodashGet(props.session, 'email', null);
    const managerEmail = props.taskReport.managerEmail || '';
    const ownerEmail = props.taskReport.ownerEmail || '';

    const isTaskCompleted = props.taskReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && props.taskReport.statusNum === CONST.REPORT.STATUS.APPROVED;

    return (
        <Pressable
            onPress={() => Navigation.navigate(ROUTES.getReportRoute(props.taskReportID))}
            style={[styles.flexRow, styles.justifyContentBetween]}
        >
            <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                <Checkbox
                    style={[styles.mr2]}
                    containerStyle={[styles.taskCheckbox]}
                    isChecked={isTaskCompleted}
                    onPress={() => {
                    // Being implemented in https://github.com/Expensify/App/issues/16858
                    }}
                />
                <Text>{props.taskReport.reportName}</Text>
            </View>
            <Icon src={Expensicons.ArrowRight} fill={StyleUtils.getIconFillColor(getButtonState(props.isHovered))} />
        </Pressable>

    );
};

TaskPreview.propTypes = propTypes;
TaskPreview.defaultProps = defaultProps;
TaskPreview.displayName = 'TaskPreview';

export default compose(
    withLocalize,
    withOnyx({
        taskReport: {
            key: ({taskReportID}) => `${ONYXKEYS.COLLECTION.REPORT}${taskReportID}`,
        },
    }),
)(TaskPreview);
