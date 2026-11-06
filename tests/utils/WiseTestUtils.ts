import {READ_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

import type {MockFetch} from './TestHelper';

/** Makes the mocked server answer the KYC review link request with the link, the way the backend fills `wiseKYCReviewEmbeddedLink` */
function mockKYCReviewLinkResponse(mockFetch: MockFetch, url: string) {
    mockFetch.mockAPICommand(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, () => ({
        onyxData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, value: {url}}],
    }));
}

// eslint-disable-next-line import/prefer-default-export -- Named export so more Wise test helpers can join this module
export {mockKYCReviewLinkResponse};
