import React from 'react';
import HTML from 'react-native-render-html';
import {
    Linking, ActivityIndicator, View, Platform
} from 'react-native';
import PropTypes from 'prop-types';
import Str from '../../../lib/Str';
import ReportActionFragmentPropTypes from './ReportActionFragmentPropTypes';
import styles, {webViewStyles, colors} from '../../../style/StyleSheet';
import Text from '../../../components/Text';
import AnchorForCommentsOnly from '../../../components/AnchorForCommentsOnly';
import {getAuthToken} from '../../../lib/API';

const propTypes = {
    // The message fragment needing to be displayed
    fragment: ReportActionFragmentPropTypes.isRequired,

    // Is this fragment an attachment?
    isAttachment: PropTypes.bool,
};

const defaultProps = {
    isAttachment: false
};

class ReportActionItemFragment extends React.PureComponent {
    constructor(props) {
        super(props);

        this.alterNode = this.alterNode.bind(this);

        // Define the custom render methods
        // For <a> tags, the <Anchor> attribute is used to be more cross-platform friendly
        this.customRenderers = {
            a: (htmlAttribs, children, convertedCSSStyles, passProps) => (
                <AnchorForCommentsOnly
                    href={htmlAttribs.href}
                    target={htmlAttribs.target}
                    rel={htmlAttribs.rel}
                    style={passProps.style}
                    key={passProps.key}
                >
                    {children}
                </AnchorForCommentsOnly>
            ),
        };
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
            htmlNode.attribs.src = `${node.attribs.src}?authToken=${getAuthToken()}`;
            return htmlNode;
        }
    }

    render() {
        const {fragment} = this.props;
        switch (fragment.type) {
            case 'COMMENT':
                // If this is an attachment placeholder, return the placeholder component
                if (this.props.isAttachment && fragment.html === fragment.text) {
                    return (
                        <View style={[styles.chatItemAttachmentPlaceholder]}>
                            <ActivityIndicator
                                size="large"
                                color={colors.textSupporting}
                                style={[styles.h100p]}
                            />
                        </View>
                    );
                }

                // Only render HTML if we have html in the fragment
                return fragment.html !== fragment.text
                    ? (
                        <HTML

                            // HACK - Android selection causes performance issues, temporarily disable it until we fix
                            textSelectable={Platform.OS !== 'android'}
                            renderers={this.customRenderers}
                            baseFontStyle={webViewStyles.baseFontStyle}
                            tagsStyles={webViewStyles.tagStyles}
                            onLinkPress={(event, href) => Linking.openURL(href)}
                            html={fragment.html}
                            alterNode={this.alterNode}
                        />
                    )
                    : (
                        <Text

                            // HACK - Android selection causes performance issues, temporarily disable it until we fix
                            selectable={Platform.OS !== 'android'}
                        >
                            {Str.htmlDecode(fragment.text)}
                        </Text>
                    );
            case 'TEXT':
                return (
                    <Text

                        // HACK - Android selection causes performance issues, temporarily disable it until we fix
                        selectable={Platform.OS !== 'android'}
                        style={[styles.chatItemMessageHeaderSender]}
                    >
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

ReportActionItemFragment.propTypes = propTypes;
ReportActionItemFragment.defaultProps = defaultProps;
ReportActionItemFragment.displayName = 'ReportActionItemFragment';

export default ReportActionItemFragment;
