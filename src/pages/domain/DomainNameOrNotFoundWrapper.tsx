import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';

import useOnyx from '@hooks/useOnyx';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import ONYXKEYS from '@src/ONYXKEYS';
import {domainNameSelector} from '@src/selectors/Domain';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import type {ReactNode} from 'react';

import React from 'react';

type DomainNameOrNotFoundWrapperProps = {
    /** AccountID of the domain */
    domainAccountID: number;

    /** Called when the not found page's link is pressed */
    onLinkPress?: () => void;

    /** The children to render once the domain name has loaded, given the loaded domain name */
    children: (domainName: string) => ReactNode;
};

function DomainNameOrNotFoundWrapper({domainAccountID, onLinkPress, children}: DomainNameOrNotFoundWrapperProps) {
    const [domainName, domainNameResult] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});

    if (isLoadingOnyxValue(domainNameResult)) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    if (!domainName) {
        return <NotFoundPage onLinkPress={onLinkPress} />;
    }

    return children(domainName);
}

export default DomainNameOrNotFoundWrapper;
