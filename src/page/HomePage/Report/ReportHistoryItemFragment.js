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
     * Function to edit HTML on the fly before it's rendered, currently this attaches authTokens as a URL parameters
     *
     * @param {object} node
     * @returns {*}
     */
    alterNode(node) {
        const htmlNode = node;
        if (htmlNode.name === 'img') {
            htmlNode.attribs.src = `${node.attribs.src}?authToken=${this.props.authToken}`;
            return htmlNode;
        }
    }

    render() {
        switch (this.props.fragment.type) {
            case 'COMMENT':
                // Only render HTML if we have html in the fragment
                return this.props.fragment.html !== this.props.fragment.text
                    ? (
                        <HTML
                            baseFontStyle={webViewStyles.baseFontStyle}
                            tagsStyles={webViewStyles.tagStyles}
                            onLinkPress={(event, href) => Linking.openURL(href)}
                            html={this.props.fragment.html}
                            alterNode={this.alterNode}
                        />
                    )
                    : <Text>{Str.htmlDecode(this.props.fragment.text)}</Text>;
            case 'TEXT':
                return (
                    <Text style={[styles.chatItemMessageHeaderSender]}>
                        {Str.htmlDecode(this.props.fragment.text)}
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
                return <Text>this.props.fragment.text</Text>;
        }
    }
}

ReportHistoryItemFragment.propTypes = propTypes;
ReportHistoryItemFragment.displayName = 'ReportHistoryItemFragment';

export default ReportHistoryItemFragment;
