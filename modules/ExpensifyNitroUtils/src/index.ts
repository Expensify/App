import { NitroModules } from 'react-native-nitro-modules';
import NavBarManager from './NavBarManager';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';
import type * as NavBarManagerModuleSpec from './specs/NavBarManagerModule.nitro';


const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');
const NavBarManagerNitroModule = NitroModules.createHybridObject<NavBarManagerModuleSpec.NavBarManagerModule>('NavBarManagerModule');

export {ContactsNitroModule, NavBarManagerNitroModule, NavBarManager};
export * from './specs/ContactsModule.nitro';
export * from './NavBarManager/types';
