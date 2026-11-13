// Native apps don't have the wide flat navigation, so Concierge conversations always open in the Inbox
function getConciergeConversationPath(path: string): string {
    return path.replace(/^\/concierge\/(\d+)(\/\d+)?(?=[?#]|$)/, (_match, reportID: string, reportActionPath: string | undefined) => `/r/${reportID}${reportActionPath ?? ''}`);
}

function getConciergeDisplayPath(path: string): string {
    return path;
}

export {getConciergeConversationPath, getConciergeDisplayPath};
