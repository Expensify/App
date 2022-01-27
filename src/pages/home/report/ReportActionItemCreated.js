import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import ONYXKEYS from '../../../ONYXKEYS';
import RoomHeaderAvatars from '../../../components/RoomHeaderAvatars';
import ReportWelcomeText from '../../../components/ReportWelcomeText';
import * as ReportUtils from '../../../libs/reportUtils';
import styles from '../../../styles/styles';

const propTypes = {
    report: PropTypes.oneOfType([PropTypes.object]),
};
const defaultProps = {
    report: {},
};

const ReportActionItemCreated = (props) => {
    const isChatRoom = ReportUtils.isChatRoom(props.report);

    return (
        <View style={[styles.chatContent, styles.chatContentCreated]}>
            <View style={[styles.justifyContentCenter, styles.alignItemsCenter, styles.flex1]}>
                <RoomHeaderAvatars
                    avatarImageURLs={props.report.icons}
                    secondAvatarStyle={[styles.secondAvatarHovered]}
                    isChatRoom={isChatRoom}
                />
                <ReportWelcomeText report={props.report} shouldIncludeParticipants={!isChatRoom} />
            </View>
        </View>
    );
};

ReportActionItemCreated.defaultProps = defaultProps;
ReportActionItemCreated.propTypes = propTypes;


export default withOnyx({
    report: {
        key: ({reportID}) => `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
    },
})(ReportActionItemCreated);
