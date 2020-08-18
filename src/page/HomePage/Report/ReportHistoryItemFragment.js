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

/**
 * Function to edit HTML on the fly before it's rendered, currently this attaches authTokens as a URL parameters
 *
 * @param {object} node
 * @returns {*}
 */
const alterNode = (node) => {
    const htmlNode = node;
    if (htmlNode.name === 'img') {
        htmlNode.attribs.src = `${node.attribs.src}?authToken=${this.props.authToken}`;
        return htmlNode;
    }
};

const ReportHistoryItemFragment = ({fragment}) => {
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
                        alterNode={alterNode}
                    />
                )
                : <Text>{Str.htmlDecode(fragment.text)}</Text>;

            // return fragment.html
            //     ? (
            //         <Text
            //             dangerouslySetInnerHTML={{__html: Str.nl2br(fragment.html)}}
            //         />
            //         // <ClickCapturer
            //         //     html={fragment.html}
            //         //     onImageClick={(img) => {
            //         //         const src = get(img, ['dataset', 'expensifySource'], img.src);
            //         //         PubSub.publish(EVENT.REPORT.SHOW_ATTACHMENT, {src});
            //         //     }}
            //         // />
            //     )
            //     : <Text>{Str.htmlDecode(fragment.text)}</Text>;
        case 'TEXT':
            return <Text style={[styles.chatItemMessageHeaderSender]}>{Str.htmlDecode(fragment.text)}</Text>;
        case 'LINK':
            return <Text>LINK</Text>;

            // return (
            //     <a
            //         className={styleClass}
            //         href={fragment.href}
            //         rel="noopener noreferrer"
            //         target={fragment.target}
            //     >
            //         {Str.htmlDecode(fragment.text)}
            //     </a>
            // );
        case 'INTEGRATION_COMMENT':
            return <Text>REPORT_LINK</Text>;

            // return (
            //     <div>
            //         <div className="history-integration-item">
            //             <div className="history-integration-item__icon">
            //                 <img
            //                     className="avatar"
            //                     src={fragment.iconUrl}
            //                     alt="Integration Icon"
            //                 />
            //             </div>
            //             <div
            //                 dangerouslySetInnerHTML={{__html: Str.nl2br(fragment.text)}}
            //             />
            //         </div>
            //     </div>
            // );
        case 'REPORT_LINK':
            return <Text>REPORT_LINK</Text>;

            // return (
            //     <ChangePageLink
            //         text={fragment.text}
            //         ariaLabel={`navigate to report ${fragment.text}`}
            //         page="report"
            //         param={{pageReportID: fragment.reportID, keepCollection: true}}
            //     />
            // );
        case 'POLICY_LINK':
            return <Text>POLICY_LINK</Text>;

            // return (
            //     <ChangePageLink
            //         ariaLabel={`navigate to policy ${fragment.text}`}
            //         text={fragment.text}
            //         page="policy"
            //         param={{policyID: fragment.policyID}}
            //     />
            // );

        // If we have a message fragment type of OLD_MESSAGE this means we have not yet converted this over to the new
        // data structure
        // So we simply set this message as inner html and render it like we did before. This wil allow us to convert
        // messages over to the new
        // structure without needing to do it all at once.
        case 'OLD_MESSAGE':
            return <Text>OLD_MESSAGE</Text>;
        default:
            return <Text>fragment.text</Text>;
    }
};

ReportHistoryItemFragment.propTypes = propTypes;
ReportHistoryItemFragment.displayName = 'ReportHistoryItemFragment';

export default ReportHistoryItemFragment;
