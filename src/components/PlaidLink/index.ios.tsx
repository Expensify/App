import type PlaidLinkProps from './types';
import BaseNativePlaidLink from './BaseNativePlaidLink';

function PlaidLink(props: PlaidLinkProps) {
    return (
        <BaseNativePlaidLink
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default PlaidLink;
