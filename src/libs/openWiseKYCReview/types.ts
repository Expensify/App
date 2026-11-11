/** Opens Wise's form at `url`. `statusPath` is the status page's path, which the mobile screen for the form opens over */
type OpenWiseKYCReview = (url: string, statusPath: string) => void;

/** Builds the URL Wise redirects to when its form ends. `environmentURL` matters only on native, where the form's WebView stops at a URL on its host */
type GetWiseKYCRedirectURL = (statusPath: string, environmentURL: string) => string;

export default OpenWiseKYCReview;
export type {GetWiseKYCRedirectURL};
