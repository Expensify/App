/**
 * Since client-side logging is currently supported on web and desktop natively right now,
 * this menu will be hidden in iOS and Android.
 * See comment here: https://github.com/Expensify/App/issues/43256#issuecomment-2154610196
 */
function ClientSideLoggingToolMenu() {
    return null;
}

ClientSideLoggingToolMenu.displayName = 'ClientSideLoggingToolMenu';

export default ClientSideLoggingToolMenu;
