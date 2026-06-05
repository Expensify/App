import CONST from '@src/CONST';

function shouldWaitForDomainFeedData(
    workspaceAccountID: number,
    domainOrWorkspaceAccountID: number,
    hasFeedsLoaded: boolean,
    isOffline: boolean,
    isInitialFeedFetchSettled: boolean,
): boolean {
    return workspaceAccountID === CONST.DEFAULT_NUMBER_ID && domainOrWorkspaceAccountID === CONST.DEFAULT_NUMBER_ID && !hasFeedsLoaded && !isOffline && !isInitialFeedFetchSettled;
}

function shouldSynthesizeWorkspaceFeedsLoadError(domainOrWorkspaceAccountID: number, isPolicyLoaded: boolean, isOffline: boolean, isWaitingForDomainFeedData: boolean): boolean {
    return domainOrWorkspaceAccountID === CONST.DEFAULT_NUMBER_ID && isPolicyLoaded && !isOffline && !isWaitingForDomainFeedData;
}

export {shouldSynthesizeWorkspaceFeedsLoadError, shouldWaitForDomainFeedData};
