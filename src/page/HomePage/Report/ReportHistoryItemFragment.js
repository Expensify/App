import React from 'react';
import HTML from 'react-native-render-html';
import {Linking} from 'react-native';
import PropTypes from 'prop-types';
import Str from '../../../lib/Str';
import ReportHistoryFragmentPropTypes from './ReportHistoryFragmentPropTypes';
import styles, {webViewStyles} from '../../../style/StyleSheet';
import Text from '../../../components/Text';

const propTypes = {
    // The message fragment needing to be displayed
    fragment: ReportHistoryFragmentPropTypes.isRequired,

    // Current users auth token
    authToken: PropTypes.string.isRequired
};

class ReportHistoryItemFragment extends React.PureComponent {
    constructor(props) {
        super(props);

        this.alterNode = this.alterNode.bind(this);
    }

    /**
     * Function to edit HTML on the fly before it's rendered, currently this attaches authTokens as a URL parameter to
     * load image attachments.
     *
     * @param {object} node
     * @returns {object}
     */
    alterNode(node) {
        const htmlNode = node;
        if (htmlNode.name === 'img') {
            console.log(`in alterNode ${JSON.stringify(this.props)}`);
            htmlNode.attribs.src = `${node.attribs.src}?authToken=24EE027C45801BE5D71AC09C8D26C13200B80C7DF4913D76078AB4603DEBDDC508E3E475F1883F396D722679574B309557AB6F49448E05F0975DCFB39F4EC3077015A40961D4ACCCDC59590655E29D9D2983E9F41D982E38600D4FDE08E3E3313443E6D8FF81DD0E93DDC1ACE80BE061DB03A7B3C8703F2E93A72DA9F4715A9B413338D1A25B67B7FAFA8A59DBEC5CFA6101AA0641D6D33F4D11C3FF0AFC1D8A6AA16368D7C0789B82C401E3362AA1B97F2DEE9D242B74C60B62B06C851670ABBC2FB9D17A91067122C9978B21E929BB73761E43B32F80C278086813811519208205480CEAC3861B3C6B3A06BF7946DB`;
            return htmlNode;
        }
    }

    render() {
        const {fragment} = this.props;
        switch (fragment.type) {
            case 'COMMENT':
                // Only render HTML if we have html in the fragment
                return fragment.html !== fragment.text
                    ? (
                        <HTML
                            baseFontStyle={webViewStyles.baseFontStyle}
                            tagsStyles={webViewStyles.tagStyles}
                            onLinkPress={(event, href) => Linking.openURL(href)}
                            html={fragment.html}
                            alterNode={this.alterNode}
                        />
                    )
                    : <Text>{Str.htmlDecode(fragment.text)}</Text>;
            case 'TEXT':
                return (
                    <Text style={[styles.chatItemMessageHeaderSender]}>
                        {Str.htmlDecode(fragment.text)}
                    </Text>
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

ReportHistoryItemFragment.propTypes = propTypes;
ReportHistoryItemFragment.displayName = 'ReportHistoryItemFragment';

export default ReportHistoryItemFragment;
