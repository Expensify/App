import React from 'react';
import HTML from 'react-native-render-html';
import {
    Linking, ActivityIndicator, View, Dimensions
} from 'react-native';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import ReportActionFragmentPropTypes from './ReportActionFragmentPropTypes';
import styles, {webViewStyles, colors} from '../../../styles/StyleSheet';
import Text from '../../../components/Text';
import AnchorForCommentsOnly from '../../../components/AnchorForCommentsOnly';
import InlineCodeBlock from '../../../components/InlineCodeBlock';
import ImageThumbnailWithModal from '../../../components/ImageThumbnailWithModal';
import Config from '../../../CONFIG';

const propTypes = {
    // The message fragment needing to be displayed
    fragment: ReportActionFragmentPropTypes.isRequired,

    // Is this fragment an attachment?
    isAttachment: PropTypes.bool,

    // Does this fragment belong to a reportAction that has not yet loaded?
    loading: PropTypes.bool,
};

const defaultProps = {
    isAttachment: false,
    loading: false,
};

class ReportActionItemFragment extends React.PureComponent {
    constructor(props) {
        super(props);

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
                    // eslint-disable-next-line react/jsx-props-no-multi-spaces
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
            blockquote: (htmlAttribs, children, convertedCSSStyles, passProps) => (
                <View
                    key={passProps.key}
                    style={webViewStyles.blockquoteTagStyle}
                >
                    {children}
                </View>
            ),
            img: (htmlAttribs, children, convertedCSSStyles, passProps) => {
                // Attaches authTokens as a URL parameter to load image attachments
                let previewSource = htmlAttribs['data-expensify-source']
                    ? `${htmlAttribs.src}?authToken=`
                    : htmlAttribs.src;

                let source = htmlAttribs['data-expensify-source']
                    ? `${htmlAttribs['data-expensify-source']}?authToken=`
                    : htmlAttribs.src;

                // Update the image URL so the images can be accessed depending on the config environment
                previewSource = previewSource.replace(
                    Config.EXPENSIFY.URL_EXPENSIFY_COM,
                    Config.EXPENSIFY.URL_API_ROOT
                );
                source = source.replace(
                    Config.EXPENSIFY.URL_EXPENSIFY_COM,
                    Config.EXPENSIFY.URL_API_ROOT
                );

                return (
                    <ImageThumbnailWithModal
                        previewSourceURL={previewSource}
                        sourceURL={source}
                        key={passProps.key}
                    />
                );
            },
        };
    }

    render() {
        const {fragment} = this.props;
        const maxImageDimensions = 512;
        const windowWidth = Dimensions.get('window').width;
        switch (fragment.type) {
            case 'COMMENT':
                // If this is an attachment placeholder, return the placeholder component
                if (this.props.isAttachment && this.props.loading) {
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
