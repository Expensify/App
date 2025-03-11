import React from 'react';
import ReactDOMServer from 'react-dom/server';
import Onyx from 'react-native-onyx';
import type {OnyxUpdate} from 'react-native-onyx';
import {AppRegistry} from 'react-native-web';
import type {ValueOf} from 'type-fest';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../tests/utils/waitForBatchedUpdates';
import LiveReloadServer from '../LiveReloadServer';
import EmailRoot from './components/EmailRoot';
import EmailTemplate from './components/EmailTemplate';
import NotificationRegistry from './components/notifications/NotificationRegistry';
import SSR_CONST from './CONST';
import postProcessHTML from './postProcessHTML';

type RenderEmailOptions = {
    env: ValueOf<typeof SSR_CONST.ENV>;
    notificationName: keyof typeof NotificationRegistry;
    onyxData?: OnyxUpdate[];
};

export default async function renderEmail({env, notificationName, onyxData = []}: RenderEmailOptions) {
    // Initialize onyx with default data
    Onyx.init({
        keys: ONYXKEYS,
        initialKeyStates: {
            // Clear any loading and error messages so they do not appear on app startup
            [ONYXKEYS.SESSION]: {loading: false},
            [ONYXKEYS.ACCOUNT]: CONST.DEFAULT_ACCOUNT_DATA,
            [ONYXKEYS.NETWORK]: CONST.DEFAULT_NETWORK_DATA,
            [ONYXKEYS.IS_SIDEBAR_LOADED]: false,
            [ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT]: true,
            [ONYXKEYS.MODAL]: {
                isVisible: false,
                willAlertModalBecomeVisible: false,
            },
            [ONYXKEYS.NVP_PREFERRED_LOCALE]: CONST.LOCALES.EN,
            [ONYXKEYS.PREFERRED_THEME]: CONST.THEME.LIGHT,
            [ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE]: {},
        },
        skippableCollectionMemberIDs: CONST.SKIPPABLE_COLLECTION_MEMBER_IDS,
    });
    initOnyxDerivedValues();

    // Set provided data and wait for batched updates
    await Onyx.update(onyxData);
    await waitForBatchedUpdates();

    // Look up the notification component
    const NotificationComponent = NotificationRegistry[notificationName];
    if (!NotificationComponent) {
        const errorMessage = `Notification ${notificationName} not found.`;
        Log.alert(errorMessage);
        throw new Error(errorMessage);
    }

    // Register with AppRegistry for react-native-web SSR
    // See: https://necolas.github.io/react-native-web/docs/rendering/#server-api
    AppRegistry.registerComponent(notificationName, () => () => (
        <EmailRoot>
            <EmailTemplate>
                <NotificationComponent />
            </EmailTemplate>
        </EmailRoot>
    ));

    // Render the email
    const {element, getStyleElement} = AppRegistry.getApplication(notificationName);
    const renderedHTML = ReactDOMServer.renderToString(element);
    const css = ReactDOMServer.renderToStaticMarkup(getStyleElement());

    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Email Preview</title>
    <link rel="icon" href="favicon.png">
    ${css}
    ${env === SSR_CONST.ENV.SERVER ? LiveReloadServer.clientConnectionScript : ''}
  </head>
  <body>
    ${renderedHTML}
  </body>
</html>`;

    return postProcessHTML(html);
}
