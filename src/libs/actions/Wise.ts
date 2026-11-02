import asyncOpenURL from '@libs/asyncOpenURL';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

const MOCK_RESPONSE_DELAY_MS = 1000;

/** Fetches a fresh link to Wise's hosted KYC form for the bank account and redirects the user to it */
function openWiseKYCReviewForm(bankAccountID: number) {
    Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {isLoading: true});

    // TODO: Call GetWiseKYCReviewEmbeddedLink once Auth ships it (https://github.com/Expensify/Expensify/issues/690547). Until then a fake link arrives after a delay.
    const linkPromise = new Promise<string>((resolve) => {
        setTimeout(() => resolve(`https://sandbox.transferwise.tech/kyc-review?bankAccountID=${bankAccountID}`), MOCK_RESPONSE_DELAY_MS);
    });

    asyncOpenURL(
        linkPromise.finally(() => Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, {isLoading: false})),
        (url) => url,
        undefined,
        true,
    );
}

// eslint-disable-next-line import/prefer-default-export
export {openWiseKYCReviewForm};
