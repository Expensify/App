import {NitroModules} from 'react-native-nitro-modules';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');

export {ContactsNitroModule};
export * from './specs/ContactsModule.nitro';
