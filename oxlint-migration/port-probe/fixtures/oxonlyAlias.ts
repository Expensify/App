// Parity fixture for @dword-design/import-alias/prefer-alias, enabled identically on both sides
// with production's alias map verbatim. Both tools resolve the map through
// babel-plugin-module-resolver against process.cwd(), which for this probe is port-probe/ (that
// is where compareFixtures.py runs both linters), so `@src` points at port-probe/src here rather
// than at the app's src/.
//
// The violation is a *parent* import, not a `./src/CONST` subpath import: the plugin calls
// babel's resolvePath(), which returns relative specifiers untouched, so a same-directory
// subpath never reaches an alias check. Only `../`-style imports are matched against the alias
// directories, which is what production relies on too.

// Control: already written with the alias, so the rule must leave it alone.
import type ConstType from '@src/CONST';

// Control: a parent import that lands outside every alias directory.
import pkg from '../../package.json';
import CONST from '../src/CONST';

export const value: unknown = [CONST, pkg];

export type AliasImport = ConstType;
