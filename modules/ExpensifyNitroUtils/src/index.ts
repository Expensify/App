import {NitroModules} from 'react-native-nitro-modules';

import type AppStartTimeModule from './specs/AppStartTimeModule.nitro';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';
import type {ShareActionHandler} from './specs/ShareActionHandler.nitro';
import type {WindowBarsModule} from './specs/WindowBarsModule.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');
const AppStartTimeNitroModule = NitroModules.createHybridObject<AppStartTimeModule>('AppStartTimeModule');
const WindowBarsNitroModule = NitroModules.createHybridObject<WindowBarsModule>('WindowBarsModule');

let shareActionHandlerNitroModule: ShareActionHandler | undefined;

/** Creates the share handler on first use, because this entry point is imported at startup and sharing into the app is rare. */
function getShareActionHandlerNitroModule(): ShareActionHandler {
    shareActionHandlerNitroModule ??= NitroModules.createHybridObject<ShareActionHandler>('ShareActionHandler');
    return shareActionHandlerNitroModule;
}

export {ContactsNitroModule, AppStartTimeNitroModule, WindowBarsNitroModule, getShareActionHandlerNitroModule};
export * from './specs/ContactsModule.nitro';
export type {SharedFile, ShareActionHandler} from './specs/ShareActionHandler.nitro';
export type {default as AppStartTimeModule} from './specs/AppStartTimeModule.nitro';
export {VERTICAL_BAR_EDGE} from './specs/WindowBarsModule.nitro';
export type {TopBarRegion, VerticalBarEdge} from './specs/WindowBarsModule.nitro';
