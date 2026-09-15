// Fixture for import/no-absolute-path, kept out of importNativeBatch.ts on purpose: ESLint's
// import/extensions reports "Missing file extension" for every specifier its resolver cannot resolve,
// which any absolute specifier is, so a file holding both violations gives ESLint two findings where
// oxlint gives one. Production has no such import to collide with -- the rule exists to keep them out.
// Only import/no-absolute-path is configured here, on both tools, at production's bare "error".

// Control: the same module by relative path, reported by nothing.
import {sharedConfigValue} from './importNativeBatchHelper';

// no-absolute-path: an absolute specifier.
import absolutePathModule from '/tmp/importNativeBatchAbsolute';

export const absoluteBatchMarker = sharedConfigValue;
export const absoluteBatchImport = absolutePathModule;
