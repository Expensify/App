import type {NitroModulesProxy} from 'react-native-nitro-modules/lib/typescript/NitroModulesProxy';

import {NitroModules as NitroModulesWithPlatformTypes} from 'react-native-nitro-modules';

import type AppStartTimeModule from './specs/AppStartTimeModule.nitro';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';
import type {ShareActionHandler} from './specs/ShareActionHandler.nitro';
import type {VerticalBarModule} from './specs/VerticalBarModule.nitro';

// This module only runs on iOS and Android, but the jest typecheck resolves nitro-modules' web typings, where NitroModules
// is typed as {} because it throws on web. The native type is restated here so tests that import this module typecheck.
// Lint checks this file with the native typings, where the assertion changes nothing, hence the disable.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const NitroModules = NitroModulesWithPlatformTypes as NitroModulesProxy;

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');
const AppStartTimeNitroModule = NitroModules.createHybridObject<AppStartTimeModule>('AppStartTimeModule');
const VerticalBarNitroModule = NitroModules.createHybridObject<VerticalBarModule>('VerticalBarModule');

let shareActionHandlerNitroModule: ShareActionHandler | undefined;

/** Creates the share handler on first use, because this entry point is imported at startup and sharing into the app is rare. */
function getShareActionHandlerNitroModule(): ShareActionHandler {
    shareActionHandlerNitroModule ??= NitroModules.createHybridObject<ShareActionHandler>('ShareActionHandler');
    return shareActionHandlerNitroModule;
}

export {ContactsNitroModule, AppStartTimeNitroModule, VerticalBarNitroModule, getShareActionHandlerNitroModule};
export * from './specs/ContactsModule.nitro';
export type {SharedFile, ShareActionHandler} from './specs/ShareActionHandler.nitro';
export type {default as AppStartTimeModule} from './specs/AppStartTimeModule.nitro';
export {VERTICAL_BAR_EDGE} from './specs/VerticalBarModule.nitro';
export type {VerticalBarEdge} from './specs/VerticalBarModule.nitro';
