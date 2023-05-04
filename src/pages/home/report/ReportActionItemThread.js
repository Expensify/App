import React from 'react';
import {View, Pressable, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import styles from '../../../styles/styles';
import ReportActionItemFragment from './ReportActionItemFragment';
import reportActionPropTypes from './reportActionPropTypes';
import * as Report from '../../../libs/actions/Report';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import CONST from "../../../CONST";
import avatarPropTypes from "../../../components/avatarPropTypes";
import themeColors from "../../../styles/themes/default";
import MultipleAvatars from '../../../components/MultipleAvatars';

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
            <View style={[{flexDirection: 'row'}, styles.alignItemsCenter, styles.mt2]}>
                <MultipleAvatars
                    size={CONST.AVATAR_SIZE.SMALLER}
                    icons={props.icons}
                    shouldStackHorizontally
                    avatarTooltips={_.map(props.icons, icon => icon.name)}
                />
                <View style={[styles.flexRow, styles.lhPercent, styles.alignItemsEnd]}>
                    <Text style={[styles.link, styles.ml2, styles.h4]}>{`${props.numberOfReplies} Replies`}</Text>
                    <Text style={[styles.ml2, styles.textMicroSupporting]}>{`Last reply at ${props.mostRecentReply}`}</Text>
                </View>
            </View>

        </Pressable>
    </View>
);

ReportActionItemThread.propTypes = propTypes;
ReportActionItemThread.displayName = 'ReportActionItemThread';

export default withLocalize(ReportActionItemThread);
