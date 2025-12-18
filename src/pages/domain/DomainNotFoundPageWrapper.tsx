/* eslint-disable rulesdir/no-negated-variables */
import {adminAccountIDsSelector} from '@selectors/Domain';
import React, {useEffect} from 'react';
import type {FullPageNotFoundViewProps} from '@components/BlockingViews/FullPageNotFoundView';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import NotFoundPage from '@pages/ErrorPage/NotFoundPage';
import {getCurrentUserAccountID} from '@userActions/Report';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type DomainNotFoundPageWrapperProps = {
    /** AccountID of the domain */
    domainAccountID: number;

    /** The children to render */
    children: React.ReactNode;

    /** Props for customizing fallback pages */
    fullPageNotFoundViewProps?: FullPageNotFoundViewProps;

    /** Whether or not to block user from accessing the page */
    shouldBeBlocked?: boolean;
} & Pick<FullPageNotFoundViewProps, 'subtitleKey' | 'onLinkPress'>;

function DomainNotFoundPageWrapper({domainAccountID, shouldBeBlocked, fullPageNotFoundViewProps, ...props}: DomainNotFoundPageWrapperProps) {
    const [domain, domainMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {canBeMissing: true});
    const [adminAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: adminAccountIDsSelector,
    });
    const currentUserAccountID = getCurrentUserAccountID();
    const isAdmin = adminAccountIDs?.includes(currentUserAccountID);

    const shouldShowFullScreenLoadingIndicator = isLoadingOnyxValue(domainMetadata);
    const shouldShowNotFoundPage = !domain || !isAdmin || shouldBeBlocked;

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (shouldShowFullScreenLoadingIndicator || (domain && isAdmin)) {
            return;
        }

        Navigation.dismissModal();
    }, [domain, isAdmin, shouldShowFullScreenLoadingIndicator]);

    if (shouldShowFullScreenLoadingIndicator) {
        return <FullscreenLoadingIndicator />;
    }

    if (shouldShowNotFoundPage) {
        return (
            <NotFoundPage
                shouldForceFullScreen
                shouldShowOfflineIndicator={false}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
                }}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...fullPageNotFoundViewProps}
                shouldShowBackButton
            />
        );
    }

    return props.children;
}

export default DomainNotFoundPageWrapper;
