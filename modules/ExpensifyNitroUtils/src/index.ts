import {NitroModules} from 'react-native-nitro-modules';

import type AppStartTimeModule from './specs/AppStartTimeModule.nitro';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';
import type {VerticalBarModule} from './specs/VerticalBarModule.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');
const AppStartTimeNitroModule = NitroModules.createHybridObject<AppStartTimeModule>('AppStartTimeModule');
const VerticalBarNitroModule = NitroModules.createHybridObject<VerticalBarModule>('VerticalBarModule');

export {ContactsNitroModule, AppStartTimeNitroModule, VerticalBarNitroModule};
export * from './specs/ContactsModule.nitro';
export type {default as AppStartTimeModule} from './specs/AppStartTimeModule.nitro';
export {VERTICAL_BAR_EDGE} from './specs/VerticalBarModule.nitro';
export type {VerticalBarEdge} from './specs/VerticalBarModule.nitro';
