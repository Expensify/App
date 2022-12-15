import React from 'react';
import {Pressable, Image, View} from 'react-native';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../../../ONYXKEYS';
import RoomHeaderAvatars from '../../../components/RoomHeaderAvatars';
import ReportWelcomeText from '../../../components/ReportWelcomeText';
import participantPropTypes from '../../../components/participantPropTypes';
import * as ReportUtils from '../../../libs/ReportUtils';
import styles from '../../../styles/styles';
import OfflineWithFeedback from '../../../components/OfflineWithFeedback';
import * as Report from '../../../libs/actions/Report';
import reportPropTypes from '../../reportPropTypes';

const propTypes = {
    /** The id of the report */
    reportID: PropTypes.string.isRequired,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Personal details of all the users */
    personalDetails: PropTypes.objectOf(participantPropTypes),

    /** The policies which the user has access to and which the report could be tied to */
    policies: PropTypes.shape({
        /** Name of the policy */
        name: PropTypes.string,
    }),
};
const defaultProps = {
    report: {},
    personalDetails: {},
    policies: {},
};

const ReportActionItemCreated = (props) => {
    const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(props.report);
    const icons = ReportUtils.getIcons(props.report, props.personalDetails, props.policies);
    return (
        <OfflineWithFeedback
            pendingAction={lodashGet(props.report, 'pendingFields.addWorkspaceRoom') || lodashGet(props.report, 'pendingFields.createChat')}
            errors={lodashGet(props.report, 'errorFields.addWorkspaceRoom') || lodashGet(props.report, 'errorFields.createChat')}
            errorRowStyles={styles.addWorkspaceRoomErrorRow}
            onClose={() => Report.navigateToConciergeChatAndDeleteReport(props.report.reportID)}
        >
            <Image
                source={require('../../../../assets/images/empty-state_background-fade.png')}
                style={{position: 'absolute', bottom: '80%', width: '100%', height: '80%'}}
            />
            <View
                accessibilityLabel="Chat welcome message"
                style={[
                    styles.chatContent,
                    styles.p5,
                ]}
            >
                <View style={[styles.flex1]}>
                    <Pressable onPress={() => ReportUtils.navigateToDetailsPage(props.report)}>
                        <RoomHeaderAvatars
                            icons={icons}
                            shouldShowLargeAvatars={isPolicyExpenseChat}
                        />
                    </Pressable>
                    <ReportWelcomeText report={props.report} />
                </View>
            </View>
        </OfflineWithFeedback>
    );
};

ReportActionItemCreated.defaultProps = defaultProps;
ReportActionItemCreated.propTypes = propTypes;
ReportActionItemCreated.displayName = 'ReportActionItemCreated';

export default withOnyx({
    report: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
    },
    personalDetails: {
        key: ONYXKEYS.PERSONAL_DETAILS,
    },
    policies: {
        key: ONYXKEYS.COLLECTION.POLICY,
    },
})(ReportActionItemCreated);
