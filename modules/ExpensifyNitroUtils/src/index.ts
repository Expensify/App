import {NitroModules} from 'react-native-nitro-modules';
import type {ContactsModule} from './specs/ContactsModule.nitro';
import type {Contact} from './specs/ContactsModule.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModule>('ContactsModule');

export {ContactsNitroModule};
export type {Contact};
