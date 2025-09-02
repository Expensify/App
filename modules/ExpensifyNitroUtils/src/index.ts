import {NitroModules} from 'react-native-nitro-modules';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';
import type * as NavBarManagerModuleSpec from './specs/NavBarManagerModule.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');
const NavBarManagerNitroModule = NitroModules.createHybridObject<NavBarManagerModuleSpec.NavBarManagerModule>('NavBarManagerModule');

export {ContactsNitroModule, NavBarManagerNitroModule};
export * from './specs/ContactsModule.nitro';
export * from './specs/NavBarManagerModule.nitro';
