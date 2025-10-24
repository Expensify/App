import {Str} from 'expensify-common';
import {isConciergeChatReport, shouldUnmaskChat} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {GetChatFSClass, ShouldInitializeFullstory} from './types';

const getChatFSClass: GetChatFSClass = (context, report) => {
    if (isConciergeChatReport(report)) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    if (shouldUnmaskChat(context, report)) {
        return CONST.FULLSTORY.CLASS.UNMASK;
    }

    return CONST.FULLSTORY.CLASS.MASK;
};

const shouldInitializeFullstory: ShouldInitializeFullstory = (userMetadata, envName) => {
    const isTestEmail = userMetadata.email !== undefined && userMetadata.email.startsWith('fullstory') && userMetadata.email.endsWith(CONST.EMAIL.QA_DOMAIN);
    if ((CONST.ENVIRONMENT.PRODUCTION !== envName && !isTestEmail) || Str.extractEmailDomain(userMetadata.email ?? '') === CONST.EXPENSIFY_PARTNER_NAME) {
        return false;
    }

    return true;
};

export {getChatFSClass, shouldInitializeFullstory};
