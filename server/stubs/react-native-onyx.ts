import getCjsDefaultExport from '@server/libs/getCjsDefaultExport';
import * as OnyxNamespace from 'react-native-onyx/dist/Onyx';
import * as useOnyxNamespace from 'react-native-onyx/dist/useOnyx';

/*
 * ESM entry for react-native-onyx in the victory-chart-renderer bundle.
 *
 * Bun compile cannot reliably use the package's CJS index.js re-export of the default
 * export, so importers should keep using `react-native-onyx` while this file is wired
 * in via rnStubPlugin.
 */
const Onyx = getCjsDefaultExport(OnyxNamespace);
const useOnyx = getCjsDefaultExport(useOnyxNamespace);

export {useOnyx};
export default Onyx;
