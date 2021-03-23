import React from 'react';
import {View, Pressable, Text} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import ReportActionPropTypes from './ReportActionPropTypes';
import ReportActionItemFragment from './ReportActionItemFragment';
import styles from '../../../styles/styles';
import CONST from '../../../CONST';
import ReportActionItemDate from './ReportActionItemDate';
import Avatar from '../../../components/Avatar';
import TextInputFocusable from '../../../components/TextInputFocusable';

const propTypes = {
    // All the data of the action
    action: PropTypes.shape(ReportActionPropTypes).isRequired,

    // Draft message
    draftMessage: PropTypes.string.isRequired,
};

class ReportActionItemEdit extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const avatarUrl = this.props.action.automatic
            ? `${CONST.CLOUDFRONT_URL}/images/icons/concierge_2019.svg`
            : this.props.action.avatar;
        return (
            <View style={[styles.chatItem]}>
                <Avatar
                    style={[styles.actionAvatar]}
                    source={avatarUrl}
                />
                <View style={[styles.chatItemRight]}>
                    <View style={[styles.chatItemMessageHeader]}>
                        {_.map(this.props.action.person, (fragment, index) => (
                            <ReportActionItemFragment
                                key={`person-${this.props.action.sequenceNumber}-${index}`}
                                fragment={fragment}
                                isAttachment={this.props.action.isAttachment}
                                isLoading={this.props.action.loading}
                            />
                        ))}
                        <ReportActionItemDate timestamp={this.props.action.timestamp} />
                    </View>
                    <TextInputFocusable
                        multiline
                        ref={el => this.textInput = el}
                        onChangeText={() => {}} // Debounced saveDraftComment
                        defaultValue={this.props.draftMessage}
                        maxLines={16} // This is the same that slack has
                        style={[styles.textInputCompose, styles.flex4]}
                    />
                </View>
                <View>
                    <Pressable>
                        <Text>
                            Cancel
                        </Text>
                    </Pressable>
                    <Pressable>
                        <Text>
                            Save
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }
}

ReportActionItemEdit.propTypes = propTypes;
export default ReportActionItemEdit;
