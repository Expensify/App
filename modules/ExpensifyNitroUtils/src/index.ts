import {NitroModules} from 'react-native-nitro-modules';
import type AppStartTimeModule from './specs/AppStartTimeModule.nitro';
import type * as ContactsModuleSpec from './specs/ContactsModule.nitro';
import type {JsonParser as JsonParserSpec} from './specs/JsonParser.nitro';

const ContactsNitroModule = NitroModules.createHybridObject<ContactsModuleSpec.ContactsModule>('ContactsModule');
const AppStartTimeNitroModule = NitroModules.createHybridObject<AppStartTimeModule>('AppStartTimeModule');

// JsonParser is registered with raw JSI methods on the C++ side, so its actual
// return type at runtime is `unknown` (any JSON value), not AnyMap.
type JsonParser = Omit<JsonParserSpec, 'parse' | 'parseRows'> & {
    parse(json: string): unknown;
    parseRows(jsons: string[]): unknown[];
};

const JsonParserNitroModule = NitroModules.createHybridObject<JsonParserSpec>('JsonParser') as unknown as JsonParser;

export {ContactsNitroModule, AppStartTimeNitroModule, JsonParserNitroModule};
export * from './specs/ContactsModule.nitro';
export type {default as AppStartTimeModule} from './specs/AppStartTimeModule.nitro';
export type {JsonParser};
