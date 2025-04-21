import {NitroModules} from 'react-native-nitro-modules';
import type {Contact, ContactsModule} from './specs/ContactsModule.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModule>('ContactsModule');

export {ContactsNitroModule};
export type {Contact};
