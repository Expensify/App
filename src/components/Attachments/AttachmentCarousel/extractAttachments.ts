import {Parser as HtmlParser} from 'htmlparser2';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {Attachment} from '@components/Attachments/types';
import {getFileName, splitExtensionFromFileName} from '@libs/fileDownload/FileUtils';
import {getHtmlWithAttachmentID, getReportActionHtml, getReportActionMessage, getSortedReportActions, isMoneyRequestAction, shouldReportActionBeVisible} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {Note} from '@src/types/onyx/Report';

/**
 * Constructs the initial component state from report actions
 */
function extractAttachments(
    type: ValueOf<typeof CONST.ATTACHMENT_TYPE>,
    {
        privateNotes,
        accountID,
        parentReportAction,
        reportActions,
        report,
        isReportArchived,
    }: {
        privateNotes?: Record<number, Note>;
        accountID?: number;
        parentReportAction?: OnyxEntry<ReportAction>;
        reportActions?: OnyxEntry<ReportActions>;
        report: OnyxEntry<Report>;
        isReportArchived: boolean | undefined;
    },
) {
    const targetNote = privateNotes?.[Number(accountID)]?.note ?? '';
    const description = report?.description ?? '';
    const attachments: Attachment[] = [];
    const canUserPerformAction = canUserPerformWriteAction(report, isReportArchived);
    let currentLink = '';

    const htmlParser = new HtmlParser({
        onopentag: (name, attribs) => {
            if (name === 'a' && attribs.href) {
                currentLink = attribs.href;
            }
            if (name === 'video') {
                const source = tryResolveUrlFromApiRoot(attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]);

                const fileName = attribs[CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE] || getFileName(`${source}`);
                attachments.unshift({
                    reportActionID: attribs['data-id'],
                    attachmentID: attribs[CONST.ATTACHMENT_ID_ATTRIBUTE],
                    source: tryResolveUrlFromApiRoot(attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]),
                    isAuthTokenRequired: !!attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE],
                    file: {name: fileName},
                    duration: Number(attribs[CONST.ATTACHMENT_DURATION_ATTRIBUTE]),
                    isReceipt: false,
                    hasBeenFlagged: attribs['data-flagged'] === 'true',
                });
                return;
            }

            if (name === 'img' && attribs.src) {
                const expensifySource = attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE] ?? (new RegExp(CONST.ATTACHMENT_OR_RECEIPT_LOCAL_URL, 'i').test(attribs.src) ? attribs.src : null);
                const source = tryResolveUrlFromApiRoot(expensifySource || attribs.src);
                const previewSource = tryResolveUrlFromApiRoot(attribs.src);

                let fileName = attribs[CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE] || getFileName(`${source}`);

                const width = (attribs['data-expensify-width'] && parseInt(attribs['data-expensify-width'], 10)) || undefined;
                const height = (attribs['data-expensify-height'] && parseInt(attribs['data-expensify-height'], 10)) || undefined;

                // Public image URLs might lack a file extension in the source URL, without an extension our
                // AttachmentView fails to recognize them as images and renders fallback content instead.
                // We apply this small hack to add an image extension and ensure AttachmentView renders the image.
                const fileInfo = splitExtensionFromFileName(fileName);
                if (!fileInfo.fileExtension) {
                    fileName = `${fileInfo.fileName || 'image'}.jpg`;
                }

                // By iterating actions in chronological order and prepending each attachment
                // we ensure correct order of attachments even across actions with multiple attachments.
                attachments.unshift({
                    reportActionID: attribs['data-id'],
                    attachmentID: attribs[CONST.ATTACHMENT_ID_ATTRIBUTE],
                    source,
                    previewSource,
                    isAuthTokenRequired: !!expensifySource,
                    file: {name: fileName, width, height},
                    isReceipt: false,
                    hasBeenFlagged: attribs['data-flagged'] === 'true',
                    attachmentLink: currentLink,
                });
            }
        },
        onclosetag: (name) => {
            if (name !== 'a' || !currentLink) {
                return;
            }

            currentLink = '';
        },
    });

    if (type === CONST.ATTACHMENT_TYPE.NOTE) {
        htmlParser.write(targetNote);
        htmlParser.end();

        return attachments.reverse();
    }

    if (type === CONST.ATTACHMENT_TYPE.ONBOARDING) {
        htmlParser.write(description);
        htmlParser.end();

        return attachments.reverse();
    }

    const actions = [...(parentReportAction ? [parentReportAction] : []), ...getSortedReportActions(Object.values(reportActions ?? {}))];
    for (const [key, action] of actions.entries()) {
        if (!shouldReportActionBeVisible(action, key, canUserPerformAction) || isMoneyRequestAction(action)) {
            continue;
        }

        const decision = getReportActionMessage(action)?.moderationDecision?.decision;
        const hasBeenFlagged = decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_HIDE || decision === CONST.MODERATION.MODERATOR_DECISION_HIDDEN;
        const html = getReportActionHtml(action)
            .replaceAll('/>', `data-flagged="${hasBeenFlagged}" data-id="${action.reportActionID}"/>`)
            .replaceAll('<video ', `<video data-flagged="${hasBeenFlagged}" data-id="${action.reportActionID}" `);
        htmlParser.write(getHtmlWithAttachmentID(html, action.reportActionID));
    }
    htmlParser.end();

    return attachments.reverse();
}

export default extractAttachments;
