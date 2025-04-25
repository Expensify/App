import {NitroModules} from 'react-native-nitro-modules';
import type {Contact} from './specs/ContactsModule.nitro';
import * as ContactsModuleSpec from './specs/ContactsModule.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');

export {ContactsNitroModule};
export type {Contact};
export * from './specs/ContactsModule.nitro';
