// Native apps don't have the wide flat navigation, so Concierge conversations always open in the Inbox
function getConciergeConversationPath(path: string): string {
    return path.replace(/^\/concierge\/(\d+)(\/\d+)?(?=[?#]|$)/, (_match, reportID: string, reportActionPath: string | undefined) => `/r/${reportID}${reportActionPath ?? ''}`);
}

export {
    // eslint-disable-next-line import/prefer-default-export -- The web file exports the same name, and named exports keep both files alike
    getConciergeConversationPath,
};
