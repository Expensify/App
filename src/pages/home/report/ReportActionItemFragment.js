import React, {memo} from 'react';
import {ActivityIndicator, ImageBackground, View} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import reportActionFragmentPropTypes from './reportActionFragmentPropTypes';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import themeColors from '../../../styles/themes/default';
import RenderHTML from '../../../components/RenderHTML';
import Text from '../../../components/Text';
import Tooltip from '../../../components/Tooltip';
import * as EmojiUtils from '../../../libs/EmojiUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import canUseTouchScreen from '../../../libs/canUseTouchscreen';
import compose from '../../../libs/compose';

const propTypes = {
    /** The message fragment needing to be displayed */
    fragment: reportActionFragmentPropTypes.isRequired,

    /** Text to be shown for tooltip When Fragment is report Actor */
    tooltipText: PropTypes.string,

    /** Is this fragment an attachment? */
    isAttachment: PropTypes.bool,

    /** If this fragment is attachment than has info? */
    attachmentInfo: PropTypes.shape({
        name: PropTypes.string,
        size: PropTypes.number,
        type: PropTypes.string,
        uri: PropTypes.string,
    }),

    /** Does this fragment belong to a reportAction that has not yet loaded? */
    loading: PropTypes.bool,

    /** Should this fragment be contained in a single line? */
    isSingleLine: PropTypes.bool,

    ...windowDimensionsPropTypes,

    /** localization props */
    ...withLocalizePropTypes,
};

const defaultProps = {
    isAttachment: false,
    attachmentInfo: {
        name: '',
        size: 0,
        type: '',
        uri: '',
    },
    loading: false,
    isSingleLine: false,
    tooltipText: '',
};

const ReportActionItemFragment = (props) => {
    switch (props.fragment.type) {
        case 'COMMENT':
            // If this is an attachment placeholder, return the placeholder component
            if (props.isAttachment && props.loading) {
                return (
                    <View style={[styles.chatItemAttachmentPlaceholder]}>
                        {Str.isImage(props.attachmentInfo.name)
                            ? (
                                <ImageBackground
                                    source={{uri: props.attachmentInfo.uri}}
                                    resizeMode="cover"
                                    imageStyle={[styles.borderBottomRounded, styles.borderTopRounded]}
                                    style={[styles.flex1, styles.justifyContentCenter]}
                                >
                                    <ActivityIndicator
                                        size="large"
                                        color={themeColors.textSupporting}
                                        style={[styles.flex1]}
                                    />
                                </ImageBackground>
                            ) : (
                                <ActivityIndicator
                                    size="large"
                                    color={themeColors.textSupporting}
                                    style={[styles.flex1]}
                                />
                            )}
                    </View>
                );
            }

            // Only render HTML if we have html in the fragment
            return props.fragment.html !== props.fragment.text
                ? (
                    <RenderHTML
                        html={`<comment>${props.fragment.html + (props.fragment.isEdited ? '<edited></edited>' : '')}</comment>`}
                    />
                ) : (
                    <Text
                        selectable={!canUseTouchScreen() || !props.isSmallScreenWidth}
                        style={EmojiUtils.isSingleEmoji(props.fragment.text) ? styles.singleEmojiText : undefined}
                    >
                        {Str.htmlDecode(props.fragment.text)}
                        {props.fragment.isEdited && (
                            <Text
                                fontSize={variables.fontSizeSmall}
                                color={themeColors.textSupporting}
                            >
                                {/* Native devices do not support margin between nested Text */}
                                <Text style={styles.w1}>{' '}</Text>
                                {props.translate('reportActionCompose.edited')}
                            </Text>
                        )}
                    </Text>
                );
        case 'TEXT':
            return (
                <Tooltip text={props.tooltipText}>
                    <Text
                        selectable
                        numberOfLines={props.isSingleLine ? 1 : undefined}
                        style={[styles.chatItemMessageHeaderSender]}
                    >
                        {Str.htmlDecode(props.fragment.text)}
                    </Text>
                </Tooltip>
            );
        case 'LINK':
            return <Text>LINK</Text>;
        case 'INTEGRATION_COMMENT':
            return <Text>REPORT_LINK</Text>;
        case 'REPORT_LINK':
            return <Text>REPORT_LINK</Text>;
        case 'POLICY_LINK':
            return <Text>POLICY_LINK</Text>;

        // If we have a message fragment type of OLD_MESSAGE this means we have not yet converted this over to the
        // new data structure. So we simply set this message as inner html and render it like we did before.
        // This wil allow us to convert messages over to the new structure without needing to do it all at once.
        case 'OLD_MESSAGE':
            return <Text>OLD_MESSAGE</Text>;
        default:
            return <Text>fragment.text</Text>;
    }
};

ReportActionItemFragment.propTypes = propTypes;
ReportActionItemFragment.defaultProps = defaultProps;
ReportActionItemFragment.displayName = 'ReportActionItemFragment';

export default compose(
    withWindowDimensions,
    withLocalize,
)(memo(ReportActionItemFragment));
