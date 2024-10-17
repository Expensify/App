import type { HybridObject } from 'react-native-nitro-modules'

export interface ContactsModule
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  getAll(): void
}
