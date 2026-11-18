import {NitroModules} from 'react-native-nitro-modules';

import type AppStartTimeModule from './specs/AppStartTimeModule.nitro';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';
import type {DocumentDetectorModule} from './specs/DocumentDetectorModule.nitro';
import type {VerticalBarModule} from './specs/VerticalBarModule.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');
const AppStartTimeNitroModule = NitroModules.createHybridObject<AppStartTimeModule>('AppStartTimeModule');
const VerticalBarNitroModule = NitroModules.createHybridObject<VerticalBarModule>('VerticalBarModule');

let documentDetectorNitroModule: DocumentDetectorModule | null | undefined;
function getDocumentDetectorNitroModule(): DocumentDetectorModule | null {
    if (documentDetectorNitroModule === undefined) {
        try {
            documentDetectorNitroModule = NitroModules.createHybridObject<DocumentDetectorModule>('DocumentDetectorModule');
        } catch {
            // Builds whose native code predates the detector don't register it. Detection is then unavailable rather than
            // breaking the scan screen.
            documentDetectorNitroModule = null;
        }
    }
    return documentDetectorNitroModule;
}

export {ContactsNitroModule, AppStartTimeNitroModule, VerticalBarNitroModule, getDocumentDetectorNitroModule};
export * from './specs/ContactsModule.nitro';
export type {default as AppStartTimeModule} from './specs/AppStartTimeModule.nitro';
export type {DocumentCorner, DetectedDocument, DocumentDetectorModule, YuvFrame} from './specs/DocumentDetectorModule.nitro';
export {VERTICAL_BAR_EDGE} from './specs/VerticalBarModule.nitro';
export type {VerticalBarEdge} from './specs/VerticalBarModule.nitro';
