import {NitroModules} from 'react-native-nitro-modules';
import type {ContactsModule} from './specs/ContactsModule.nitro';
import type {Contact} from './specs/ContactsModule.nitro';
import type {UtilsModule} from './specs/UtilsModule.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModule>('ContactsModule');

const UtilsNitroModule = NitroModules.createHybridObject<UtilsModule>('UtilsModule');

export {ContactsNitroModule, UtilsNitroModule};
export type {Contact};
