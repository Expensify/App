import type { ContactsModule } from './ContactsModule.nitro'
import type { Contact } from './ContactsModule.nitro'
import { NitroModules } from 'react-native-nitro-modules'

export const ContactsNitroModule =
  NitroModules.createHybridObject<ContactsModule>('ContactsModule')

export type { Contact }
