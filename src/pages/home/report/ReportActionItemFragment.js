import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import ReportActionFragmentPropTypes from './ReportActionFragmentPropTypes';
import styles from '../../../styles/styles';
import variables from '../../../styles/variables';
import themeColors from '../../../styles/themes/default';
import RenderHTML from '../../../components/RenderHTML';
import Text from '../../../components/Text';
import Tooltip from '../../../components/Tooltip';
import {isSingleEmoji} from '../../../libs/ValidationUtils';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';

const propTypes = {
    /** The message fragment needing to be displayed */
    fragment: ReportActionFragmentPropTypes.isRequired,

    /** Text to be shown for tooltip When Fragment is report Actor */
    tooltipText: PropTypes.string,

    /** Is this fragment an attachment? */
    isAttachment: PropTypes.bool,

    /** Does this fragment belong to a reportAction that has not yet loaded? */
    loading: PropTypes.bool,

    /** Should this fragment be contained in a single line? */
    isSingleLine: PropTypes.bool,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    isAttachment: false,
    loading: false,
    isSingleLine: false,
    tooltipText: '',
};

class ReportActionItemFragment extends React.PureComponent {
    render() {
        const {fragment, tooltipText} = this.props;
        switch (fragment.type) {
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
                return fragment.html !== fragment.text
                    ? (
                        <RenderHTML
                            html={fragment.html + (fragment.isEdited ? '<edited/>' : '')}
                            debug={false}
                        />
                    ) : (
                        <Text
                            selectable={!this.props.isSmallScreenWidth}
                            style={isSingleEmoji(fragment.text) ? styles.singleEmojiText : undefined}
                        >
                            {Str.htmlDecode(fragment.text)}
                            {fragment.isEdited && (
                            <Text
                                fontSize={variables.fontSizeSmall}
                                color={themeColors.textSupporting}
                            >
                                {/* Native devices do not support margin between nested text */}
                                <Text style={styles.w1}>{' '}</Text>
                                (edited)
                            </Text>
                            )}
                        </Text>
                    );
            case 'TEXT':
                return (
                    <Tooltip text={tooltipText} >
                        <Text
                            selectable
                            numberOfLines={this.props.isSingleLine ? 1 : undefined}
                            style={[styles.chatItemMessageHeaderSender]}
                        >
                            {Str.htmlDecode(fragment.text)}
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
    }
}

ReportActionItemFragment.propTypes = propTypes;
ReportActionItemFragment.defaultProps = defaultProps;
ReportActionItemFragment.displayName = 'ReportActionItemFragment';

export default withWindowDimensions(ReportActionItemFragment);
