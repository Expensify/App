import useOnyx from '@hooks/useOnyx';

import NotFoundPage from '@pages/ErrorPage/NotFoundPage';

import ONYXKEYS from '@src/ONYXKEYS';
import {domainNameSelector} from '@src/selectors/Domain';

import type {ReactNode} from 'react';

import React from 'react';

type DomainNameOrNotFoundWrapperProps = {
    domainAccountID: number;

    /** Called when the not found page's link is pressed */
    onLinkPress?: () => void;

    /** The children to render when the domain exists, given its domain name */
    children: (domainName: string) => ReactNode;
};

function DomainNameOrNotFoundWrapper({domainAccountID, onLinkPress, children}: DomainNameOrNotFoundWrapperProps) {
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});

    if (!domainName) {
        return <NotFoundPage onLinkPress={onLinkPress} />;
    }

    return children(domainName);
}

export default DomainNameOrNotFoundWrapper;
