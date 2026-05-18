import {NitroModules} from 'react-native-nitro-modules';
import type AppStartTimeModule from './specs/AppStartTimeModule.nitro';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');
const AppStartTimeNitroModule = NitroModules.createHybridObject<AppStartTimeModule>('AppStartTimeModule');

export {ContactsNitroModule, AppStartTimeNitroModule};
export * from './specs/ContactsModule.nitro';
export type {default as AppStartTimeModule} from './specs/AppStartTimeModule.nitro';
