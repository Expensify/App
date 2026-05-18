import type GetCurrentUrl from './types';

const getCurrentUrl: GetCurrentUrl = () => window.location.href;

export default getCurrentUrl;
