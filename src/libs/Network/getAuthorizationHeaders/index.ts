import type GetAuthorizationHeaders from './types';

// A custom header makes the browser send a CORS preflight before every API call, so web keeps sending the token as a parameter only
const getAuthorizationHeaders: GetAuthorizationHeaders = () => undefined;

export default getAuthorizationHeaders;
