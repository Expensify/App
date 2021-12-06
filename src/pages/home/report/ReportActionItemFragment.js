import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import reportActionFragmentPropTypes from './reportActionFragmentPropTypes';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import themeColors from '../../../styles/themes/default';
import RenderHTML from '../../../components/RenderHTML';
import ExpensifyText from '../../../components/ExpensifyText';
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
    loading: false,
    isSingleLine: false,
    tooltipText: '',
};

class ReportActionItemFragment extends React.PureComponent {
    render() {
        switch (this.props.fragment.type) {
            case 'COMMENT':
                // If this is an attachment placeholder, return the placeholder component
                if (this.props.isAttachment && this.props.loading) {
                    return (
                        <View style={[styles.chatItemAttachmentPlaceholder]}>
                            <ActivityIndicator
                                size="large"
                                color={themeColors.textSupporting}
                                style={[styles.flex1]}
                            />
                        </View>
                    );
                }

                // Only render HTML if we have html in the fragment
                return this.props.fragment.html !== this.props.fragment.text
                    ? (
                        <RenderHTML
                            html={`<comment>${this.props.fragment.html + (this.props.fragment.isEdited ? '<edited></edited>' : '')}</comment>`}
                        />
                    ) : (
                        <ExpensifyText
                            selectable={!canUseTouchScreen() || !this.props.isSmallScreenWidth}
                            style={EmojiUtils.isSingleEmoji(this.props.fragment.text) ? styles.singleEmojiText : undefined}
                        >
                            {Str.htmlDecode(this.props.fragment.text)}
                            {this.props.fragment.isEdited && (
                                <ExpensifyText
                                    fontSize={variables.fontSizeSmall}
                                    color={themeColors.textSupporting}
                                >
                                    {/* Native devices do not support margin between nested ExpensifyText */}
                                    <ExpensifyText style={styles.w1}>{' '}</ExpensifyText>
                                    {this.props.translate('reportActionCompose.edited')}
                                </ExpensifyText>
                            )}
                        </ExpensifyText>
                    );
            case 'TEXT':
                return (
                    <Tooltip text={this.props.tooltipText}>
                        <ExpensifyText
                            selectable
                            numberOfLines={this.props.isSingleLine ? 1 : undefined}
                            style={[styles.chatItemMessageHeaderSender]}
                        >
                            {Str.htmlDecode(this.props.fragment.text)}
                        </ExpensifyText>
                    </Tooltip>
                );
            case 'LINK':
                return <ExpensifyText>LINK</ExpensifyText>;
            case 'INTEGRATION_COMMENT':
                return <ExpensifyText>REPORT_LINK</ExpensifyText>;
            case 'REPORT_LINK':
                return <ExpensifyText>REPORT_LINK</ExpensifyText>;
            case 'POLICY_LINK':
                return <ExpensifyText>POLICY_LINK</ExpensifyText>;

            // If we have a message fragment type of OLD_MESSAGE this means we have not yet converted this over to the
            // new data structure. So we simply set this message as inner html and render it like we did before.
            // This wil allow us to convert messages over to the new structure without needing to do it all at once.
            case 'OLD_MESSAGE':
                return <ExpensifyText>OLD_MESSAGE</ExpensifyText>;
            default:
                return <ExpensifyText>fragment.text</ExpensifyText>;
        }
    }
}

ReportActionItemFragment.propTypes = propTypes;
ReportActionItemFragment.defaultProps = defaultProps;

export default compose(
    withWindowDimensions,
    withLocalize,
)(ReportActionItemFragment);
