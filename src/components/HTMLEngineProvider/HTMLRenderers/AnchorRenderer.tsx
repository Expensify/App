import {Str} from 'expensify-common';
import React, {useContext, useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {TNodeChildrenRenderer} from 'react-native-render-html';
import type {CustomRendererProps, TBlock} from 'react-native-render-html';
import AnchorForAttachmentsOnly from '@components/AnchorForAttachmentsOnly';
import AnchorForCommentsOnly from '@components/AnchorForCommentsOnly';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import {ShowContextMenuContext} from '@components/ShowContextMenuContext';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useParentReport from '@hooks/useParentReport';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useThemeStyles from '@hooks/useThemeStyles';
import {getInternalExpensifyPath, getInternalNewExpensifyPath, openExternalLink, openLink} from '@libs/actions/Link';
import {isAnonymousUser} from '@libs/actions/Session';
import {canActionTask, canModifyTask, completeTask} from '@libs/actions/Task';
import {setSelfTourViewed} from '@libs/actions/Welcome';
import {hasSeenTourSelector} from '@libs/onboardingSelectors';
import {getNavatticURL} from '@libs/TourUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type AnchorRendererProps = CustomRendererProps<TBlock> & {
    /** Key of the element */
    key?: string;
};

function AnchorRenderer({tnode, style, key}: AnchorRendererProps) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {report, action} = useContext(ShowContextMenuContext);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [viewTourTaskReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${introSelected?.viewTour}`, {canBeMissing: true});
    const [hasSeenTour = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
        canBeMissing: true,
    });
    const parentReport = useParentReport(report?.reportID);
    const isParentReportArchived = useReportIsArchived(parentReport?.reportID);
    const canModifyViewTourTask = canModifyTask(viewTourTaskReport, currentUserPersonalDetails.accountID, isParentReportArchived);
    const canActionViewTourTask = canActionTask(viewTourTaskReport, currentUserPersonalDetails.accountID, parentReport, isParentReportArchived);

    const styles = useThemeStyles();
    const htmlAttribs = tnode.attributes;
    const {environment, environmentURL} = useEnvironment();
    // An auth token is needed to download Expensify chat attachments
    const isAttachment = !!htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE];
    const tNodeChild = tnode?.domNode?.children?.at(0);
    const displayName = tNodeChild && 'data' in tNodeChild && typeof tNodeChild.data === 'string' ? tNodeChild.data : '';
    const attrHref = htmlAttribs.href || htmlAttribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE] || '';
    const parentStyle = tnode.parent?.styles?.nativeTextRet ?? {};
    const internalNewExpensifyPath = getInternalNewExpensifyPath(attrHref);
    const internalExpensifyPath = getInternalExpensifyPath(attrHref);
    const isVideo = attrHref && Str.isVideo(attrHref);
    const linkHasImage = tnode.tagName === 'a' && tnode.children.some((child) => child.tagName === 'img');

    const isDeleted = HTMLEngineUtils.isDeletedNode(tnode);
    const isChildOfTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(tnode);

    const textDecorationLineStyle = isDeleted ? styles.underlineLineThrough : {};

    const isInConciergeTaskView = action?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED && report?.type === CONST.REPORT.TYPE.TASK && report.ownerAccountID === CONST.ACCOUNT_ID.CONCIERGE;
    const isTourTask = attrHref === getNavatticURL(environment, introSelected?.choice) && (action?.actorAccountID === CONST.ACCOUNT_ID.CONCIERGE || isInConciergeTaskView);

    const onLinkPress = useMemo(() => {
        if (internalNewExpensifyPath || internalExpensifyPath) {
            return () => openLink(attrHref, environmentURL, isAttachment);
        }

        if (isTourTask && !hasSeenTour) {
            return () => {
                openExternalLink(attrHref);
                setSelfTourViewed(isAnonymousUser());
                if (viewTourTaskReport && canModifyViewTourTask && canActionViewTourTask) {
                    completeTask(viewTourTaskReport);
                }
            };
        }

        return undefined;
    }, [internalNewExpensifyPath, internalExpensifyPath, attrHref, environmentURL, isAttachment, isTourTask, hasSeenTour, viewTourTaskReport, canModifyViewTourTask, canActionViewTourTask]);

    if (!HTMLEngineUtils.isChildOfComment(tnode) && !isChildOfTaskTitle) {
        // This is not a comment from a chat, the AnchorForCommentsOnly uses a Pressable to create a context menu on right click.
        // We don't have this behaviour in other links in NewDot
        // TODO: We should use TextLink, but I'm leaving it as Text for now because TextLink breaks the alignment in Android.

        // Define link style based on context
        let linkStyle: StyleProp<TextStyle> = styles.link;

        // Special handling for links in RBR to maintain consistent font size
        if (HTMLEngineUtils.isChildOfRBR(tnode)) {
            linkStyle = [
                styles.link,
                {
                    fontSize: styles.textMicro.fontSize,
                    textDecorationLine: 'underline',
                },
            ];
        }

        return (
            <Text
                style={linkStyle}
                onPress={() => openLink(attrHref, environmentURL, isAttachment)}
                suppressHighlighting
            >
                <TNodeChildrenRenderer tnode={tnode} />
            </Text>
        );
    }

    if (isAttachment && !isVideo) {
        return (
            <AnchorForAttachmentsOnly
                source={tryResolveUrlFromApiRoot(attrHref)}
                displayName={displayName}
                isDeleted={isDeleted}
            />
        );
    }

    return (
        <AnchorForCommentsOnly
            href={attrHref}
            // Unless otherwise specified open all links in
            // a new window. On Desktop this means that we will
            // skip the default Save As... download prompt
            // and defer to whatever browser the user has.
            // eslint-disable-next-line react/jsx-props-no-multi-spaces
            target={htmlAttribs.target || '_blank'}
            rel={htmlAttribs.rel || 'noopener noreferrer'}
            style={[
                style,
                parentStyle,
                textDecorationLineStyle,
                styles.textUnderlinePositionUnder,
                styles.textDecorationSkipInkNone,
                isChildOfTaskTitle && styles.taskTitleMenuItem,
                styles.dInlineFlex,
            ]}
            key={key}
            // Only pass the press handler for internal links. For public links or whitelisted internal links fallback to default link handling
            onPress={onLinkPress}
            linkHasImage={linkHasImage}
        >
            <TNodeChildrenRenderer
                tnode={tnode}
                renderChild={(props) => {
                    if (props.childTnode.tagName === 'br') {
                        return <Text key={props.key}>{'\n'}</Text>;
                    }
                    if (props.childTnode.type === 'text' && props.childTnode.tagName !== 'code') {
                        return (
                            <Text
                                key={props.key}
                                style={[
                                    props.childTnode.getNativeStyles(),
                                    parentStyle,
                                    textDecorationLineStyle,
                                    styles.textUnderlinePositionUnder,
                                    styles.textDecorationSkipInkNone,
                                    styles.dInlineFlex,
                                ]}
                            >
                                {props.childTnode.data}
                            </Text>
                        );
                    }
                    return props.childElement;
                }}
            />
        </AnchorForCommentsOnly>
    );
}

AnchorRenderer.displayName = 'AnchorRenderer';

export default AnchorRenderer;
