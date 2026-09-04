import type CONST from '@src/CONST';

/** Result of the most recent Onyx database size measurement, persisted so the next app start can attach it to spans right away */
type DatabaseSizeMeasurement =
    | {
          /** Which mechanism produced the value */
          source: typeof CONST.TELEMETRY.DB_SIZE_SOURCE.SQLITE | typeof CONST.TELEMETRY.DB_SIZE_SOURCE.INDEXED_DB;

          /** Measured size in bytes */
          bytes: number;
      }
    | {
          /** No reliable value exists on this platform */
          source: typeof CONST.TELEMETRY.DB_SIZE_SOURCE.UNAVAILABLE;
      };

export default DatabaseSizeMeasurement;
