import {Parser as HtmlParser} from 'htmlparser2';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {Attachment} from '@components/Attachments/types';
import * as FileUtils from '@libs/fileDownload/FileUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import tryResolveUrlFromApiRoot from '@libs/tryResolveUrlFromApiRoot';
import CONST from '@src/CONST';
import type {ReportAction, ReportActions} from '@src/types/onyx';
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
    }: {privateNotes?: Record<number, Note>; accountID?: number; parentReportAction?: OnyxEntry<ReportAction>; reportActions?: OnyxEntry<ReportActions>},
) {
    const targetNote = privateNotes?.[Number(accountID)]?.note ?? '';
    const attachments: Attachment[] = [];

    // We handle duplicate image sources by considering the first instance as original. Selecting any duplicate
    // and navigating back (<) shows the image preceding the first instance, not the selected duplicate's position.
    const uniqueSources = new Set();

    const htmlParser = new HtmlParser({
        onopentag: (name, attribs) => {
            if (name === 'video') {
                const source = tryResolveUrlFromApiRoot(attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]);
                if (uniqueSources.has(source)) {
                    return;
                }

                uniqueSources.add(source);
                const fileName = attribs[CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE] || FileUtils.getFileName(`${source}`);
                attachments.unshift({
                    source: tryResolveUrlFromApiRoot(attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE]),
                    isAuthTokenRequired: !!attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE],
                    file: {name: fileName},
                    duration: Number(attribs[CONST.ATTACHMENT_DURATION_ATTRIBUTE]),
                    isReceipt: false,
                    hasBeenFlagged: false,
                });
                return;
            }

            if (name === 'img' && attribs.src) {
                const expensifySource = attribs[CONST.ATTACHMENT_SOURCE_ATTRIBUTE];
                const source = tryResolveUrlFromApiRoot(expensifySource || attribs.src);
                const previewSource = tryResolveUrlFromApiRoot(attribs.src);
                if (uniqueSources.has(source)) {
                    return;
                }

                uniqueSources.add(source);
                let fileName = attribs[CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE] || FileUtils.getFileName(`${source}`);

                const width = (attribs['data-expensify-width'] && parseInt(attribs['data-expensify-width'], 10)) || undefined;
                const height = (attribs['data-expensify-height'] && parseInt(attribs['data-expensify-height'], 10)) || undefined;

                // Public image URLs might lack a file extension in the source URL, without an extension our
                // AttachmentView fails to recognize them as images and renders fallback content instead.
                // We apply this small hack to add an image extension and ensure AttachmentView renders the image.
                const fileInfo = FileUtils.splitExtensionFromFileName(fileName);
                if (!fileInfo.fileExtension) {
                    fileName = `${fileInfo.fileName || 'image'}.jpg`;
                }

                // By iterating actions in chronological order and prepending each attachment
                // we ensure correct order of attachments even across actions with multiple attachments.
                attachments.unshift({
                    reportActionID: attribs['data-id'],
                    source,
                    previewSource,
                    isAuthTokenRequired: !!expensifySource,
                    file: {name: fileName, width, height},
                    isReceipt: false,
                    hasBeenFlagged: attribs['data-flagged'] === 'true',
                });
            }
        },
    });

    if (type === CONST.ATTACHMENT_TYPE.NOTE) {
        htmlParser.write(targetNote);
        htmlParser.end();

        return attachments.reverse();
    }

    const actions = [...(parentReportAction ? [parentReportAction] : []), ...ReportActionsUtils.getSortedReportActions(Object.values(reportActions ?? {}))];
    actions.forEach((action) => {
        if (!ReportActionsUtils.shouldReportActionBeVisible(action) || ReportActionsUtils.isMoneyRequestAction(action)) {
            return;
        }

        const decision = ReportActionsUtils.getReportActionMessage(action)?.moderationDecision?.decision;
        const hasBeenFlagged = decision === CONST.MODERATION.MODERATOR_DECISION_PENDING_HIDE || decision === CONST.MODERATION.MODERATOR_DECISION_HIDDEN;
        const html = ReportActionsUtils.getReportActionHtml(action).replace('/>', `data-flagged="${hasBeenFlagged}" data-id="${action.reportActionID}"/>`);
        htmlParser.write(html);
    });
    htmlParser.end();

    return attachments.reverse();
}

export default extractAttachments;
