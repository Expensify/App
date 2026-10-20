/**
 * Navigation checks the network for fresh HTML while the service worker keeps its offline assets.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function updateApp(isProduction: boolean) {
    window.location.reload();
}
