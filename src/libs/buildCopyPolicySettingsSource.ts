/** Builds source settings without carrying workspace feedback into either copy flow. */
import type {Policy} from '@src/types/onyx';

import buildDuplicateSettingSnapshot, {buildDuplicateSettingCollection} from './buildDuplicateSettingSnapshot';

function buildCopyPolicySettingsSource(sourcePolicy: Policy): Policy {
    const taxRates = sourcePolicy.taxRates ? buildDuplicateSettingSnapshot(sourcePolicy.taxRates) : undefined;
    const connections = buildDuplicateSettingCollection(sourcePolicy.connections);
    return {
        ...sourcePolicy,
        employeeList: sourcePolicy.employeeList ? buildDuplicateSettingCollection(sourcePolicy.employeeList) : undefined,
        fieldList: sourcePolicy.fieldList ? buildDuplicateSettingCollection(sourcePolicy.fieldList) : undefined,
        exportLayouts: sourcePolicy.exportLayouts ? buildDuplicateSettingCollection(sourcePolicy.exportLayouts) : undefined,
        mccGroup: sourcePolicy.mccGroup ? buildDuplicateSettingCollection(sourcePolicy.mccGroup) : undefined,
        connections: sourcePolicy.connections
            ? Object.fromEntries(
                  Object.entries(connections).map(([name, connection]) => [
                      name,
                      {...connection, config: connection.config ? buildDuplicateSettingSnapshot(connection.config) : connection.config},
                  ]),
              )
            : undefined,
        taxRates: taxRates ? {...taxRates, taxes: buildDuplicateSettingCollection(taxRates.taxes)} : undefined,
    };
}

export default buildCopyPolicySettingsSource;
