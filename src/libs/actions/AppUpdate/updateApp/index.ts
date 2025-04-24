/**
 * On web or mWeb we can simply refresh the page and the user should have the new version of the app downloaded.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function updateApp(isProduction: boolean) {
    window.location.reload();
}
