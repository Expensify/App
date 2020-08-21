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
    authToken: PropTypes.string
};

const defaultProps = {
    authToken: ''
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

        // We only want to attach auth tokens to images that come from Expensify attachments
        if (htmlNode.name === 'img' && htmlNode.attribs['data-expensify-source']) {
            htmlNode.attribs.src = `${node.attribs.src}?authToken=${this.props.authToken}`;
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
ReportHistoryItemFragment.defaultProps = defaultProps;
ReportHistoryItemFragment.displayName = 'ReportHistoryItemFragment';

export default ReportHistoryItemFragment;
