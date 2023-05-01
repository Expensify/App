import React from 'react';
import {View, Pressable, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import styles from '../../../styles/styles';
import ReportActionItemFragment from './ReportActionItemFragment';
import reportActionPropTypes from './reportActionPropTypes';
import * as Report from '../../../libs/actions/Report';
import RoomHeaderAvatars from '../../../components/RoomHeaderAvatars';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import CONST from "../../../CONST";
import avatarPropTypes from "../../../components/avatarPropTypes";
import themeColors from "../../../styles/themes/default";

const propTypes = {
    // childReportID: PropTypes.number.isRequired,

    icons: PropTypes.arrayOf(avatarPropTypes).isRequired,

    numberOfReplies: PropTypes.number.isRequired,

    mostRecentReply: PropTypes.string.isRequired,

    childReportID: PropTypes.string.isRequired,

    /** localization props */
    ...withLocalizePropTypes,
};

const ReportActionItemThread = props => (
    <View style={[styles.chatItemMessage]}>
        <Pressable
            onPress={() => {
                // Report.OpenChildReport(props.childReportID)
                return '';
            }}
        >
            <View style={{flexDirection: 'row'}}>
                <RoomHeaderAvatars size={CONST.AVATAR_SIZE.SMALL} icons={props.icons} />
                <Text style={{color: themeColors.text, marginTop: 12, marginLeft: 36}}>{`${props.numberOfReplies} Replies`}</Text>
                <Text style={{color: themeColors.text, marginTop: 12, marginLeft: 4}}>{`Last reply at ${props.mostRecentReply}`}</Text>
            </View>

        </Pressable>
    </View>
);

ReportActionItemThread.propTypes = propTypes;
ReportActionItemThread.displayName = 'ReportActionItemThread';

export default withLocalize(ReportActionItemThread);
