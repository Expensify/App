import React from 'react';
import HTML from 'react-native-render-html';
import {
    Linking, ActivityIndicator, View, Dimensions
} from 'react-native';
import PropTypes from 'prop-types';
import Str from '../../../libs/Str';
import ReportActionFragmentPropTypes from './ReportActionFragmentPropTypes';
import styles, {webViewStyles, colors} from '../../../styles/StyleSheet';
import Text from '../../../components/Text';
import AnchorForCommentsOnly from '../../../components/AnchorForCommentsOnly';
import ImageModal from '../../../components/ImageModal';
import {getAuthToken} from '../../../lib/API';
import InlineCodeBlock from '../../../components/InlineCodeBlock';

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

                    // Unless otherwise specified open all links in
                    // a new window. On Desktop this means that we will
                    // skip the default Save As... download prompt
                    // and defer to whatever browser the user has.
                    target={htmlAttribs.target || '_blank'}
                    rel={htmlAttribs.rel || 'noopener noreferrer'}
                    style={passProps.style}
                    key={passProps.key}
                >
                    {children}
                </AnchorForCommentsOnly>
            ),
            pre: (htmlAttribs, children, convertedCSSStyles, passProps) => (
                <View
                    key={passProps.key}
                    style={webViewStyles.preTagStyle}
                >
                    {children}
                </View>
            ),
            code: (htmlAttribs, children, convertedCSSStyles, passProps) => (
                <InlineCodeBlock key={passProps.key}>
                    {children}
                </InlineCodeBlock>
            ),
            img: (htmlAttribs, children, convertedCSSStyles, passProps) => (
                <ImageModal previewSrcURL={htmlAttribs.preview} srcURL={htmlAttribs.src} style={webViewStyles.tagStyles.img} key={passProps.key} />
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
            htmlNode.attribs.preview = `${node.attribs.src}?authToken=${getAuthToken()}`;
            htmlNode.attribs.src = htmlNode.attribs['data-expensify-source'] + `?authToken=${getAuthToken()}`;
            return htmlNode;
        }
    }

    render() {
        const {fragment} = this.props;
        const maxImageDimensions = 512;
        const windowWidth = Dimensions.get('window').width;
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
                            textSelectable
                            renderers={this.customRenderers}
                            baseFontStyle={webViewStyles.baseFontStyle}
                            tagsStyles={webViewStyles.tagStyles}
                            onLinkPress={(event, href) => Linking.openURL(href)}
                            html={fragment.html}
                            alterNode={this.alterNode}
                            imagesMaxWidth={Math.min(maxImageDimensions, windowWidth * 0.8)}
                            imagesInitialDimensions={{width: maxImageDimensions, height: maxImageDimensions}}
                        />
                    )
                    : (
                        <Text selectable>
                            {Str.htmlDecode(fragment.text)}
                        </Text>
                    );
            case 'TEXT':
                return (
                    <Text
                        selectable
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
