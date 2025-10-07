import BaseNativePlaidLink from './BaseNativePlaidLink';
import type PlaidLinkProps from './types';

function PlaidLink(props: PlaidLinkProps) {
    return (
        <BaseNativePlaidLink
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

export default PlaidLink;
