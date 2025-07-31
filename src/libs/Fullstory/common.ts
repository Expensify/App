import {isConciergeChatReport, shouldUnmaskChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {GetChatFSClass} from './types';

const getChatFSClass: GetChatFSClass = (context, report) => {
    if (isConciergeChatReport(report)) {
        return CONST.FULL_STORY.UNMASK;
    }

    if (shouldUnmaskChat(context, report)) {
        return CONST.FULL_STORY.UNMASK;
    }

    return CONST.FULL_STORY.MASK;
};

export default getChatFSClass;
