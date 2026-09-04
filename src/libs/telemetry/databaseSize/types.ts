import type DatabaseSizeMeasurement from '@src/types/onyx/DatabaseSizeMeasurement';

type MeasureDatabaseSize = () => Promise<DatabaseSizeMeasurement>;

export default MeasureDatabaseSize;
