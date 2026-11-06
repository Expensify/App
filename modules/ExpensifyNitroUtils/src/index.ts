import {NitroModules} from 'react-native-nitro-modules';

import type AppStartTimeModule from './specs/AppStartTimeModule.nitro';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';
import type {ShareActionHandler} from './specs/ShareActionHandler.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');
const AppStartTimeNitroModule = NitroModules.createHybridObject<AppStartTimeModule>('AppStartTimeModule');
const ShareActionHandlerNitroModule = NitroModules.createHybridObject<ShareActionHandler>('ShareActionHandler');

export {ContactsNitroModule, AppStartTimeNitroModule, ShareActionHandlerNitroModule};
export type {ShareActionHandler, SharedFile} from './specs/ShareActionHandler.nitro';
export * from './specs/ContactsModule.nitro';
export type {default as AppStartTimeModule} from './specs/AppStartTimeModule.nitro';
