import type PlaidLinkProps from './types';

import BaseNativePlaidLink from './BaseNativePlaidLink';

function PlaidLink(props: PlaidLinkProps) {
    return <BaseNativePlaidLink {...props} />;
}

export default PlaidLink;
