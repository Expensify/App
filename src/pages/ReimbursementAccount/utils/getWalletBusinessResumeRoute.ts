type PageConfiguration = {
    pageName: string;
    subPages?: readonly string[];
};

type GetWalletBusinessResumeRouteParams = {
    savedPage: string | undefined;
    savedSubPage: string | undefined;
    savedAction?: 'edit';
    fallbackPage: string;
    fallbackSubPage: string | undefined;
    pages: readonly PageConfiguration[];
    hasBankAccountID: boolean;
    preAccountPage: string;
};

type ResumeRoute = {
    page: string;
    subPage?: string;
    action?: 'edit';
};

/**
 * Resolve a Wallet business setup route without letting stale local progress skip a backend-controlled step.
 * Before an account exists, only the bank-information page can be restored from the local draft. After creation,
 * the saved route may match or precede the backend-derived page, so navigating backward is preserved without letting
 * local progress skip a backend-controlled step.
 */
function getWalletBusinessResumeRoute({
    savedPage,
    savedSubPage,
    savedAction,
    fallbackPage,
    fallbackSubPage,
    pages,
    hasBankAccountID,
    preAccountPage,
}: GetWalletBusinessResumeRouteParams): ResumeRoute {
    const savedPageConfiguration = pages.find((page) => page.pageName === savedPage);
    if (!savedPageConfiguration) {
        return {page: fallbackPage, subPage: fallbackSubPage};
    }

    const hasValidSubPage = savedPageConfiguration.subPages ? !!savedSubPage && savedPageConfiguration.subPages.includes(savedSubPage) : !savedSubPage;
    if (!hasValidSubPage) {
        return {page: fallbackPage, subPage: fallbackSubPage};
    }

    const savedPageIndex = pages.indexOf(savedPageConfiguration);
    const fallbackPageIndex = pages.findIndex((page) => page.pageName === fallbackPage);
    const canUseSavedPage = hasBankAccountID ? fallbackPageIndex >= 0 && savedPageIndex <= fallbackPageIndex : savedPage === preAccountPage;
    if (!canUseSavedPage) {
        return {page: fallbackPage, subPage: fallbackSubPage};
    }

    return {page: savedPageConfiguration.pageName, subPage: savedSubPage, ...(savedAction ? {action: savedAction} : {})};
}

export default getWalletBusinessResumeRoute;
