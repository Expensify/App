import {isConciergeChatReport, shouldUnmaskChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {GetChatFSClass} from './types';

const getChatFSClass: GetChatFSClass = (context, report) => {
    if (isConciergeChatReport(report)) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    if (shouldUnmaskChat(context, report)) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    return CONST.FULLSTORY.CLASS.MASK;
};

export default getChatFSClass;
