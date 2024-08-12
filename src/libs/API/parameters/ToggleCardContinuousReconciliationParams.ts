import type {ReconciliationConnectionSettings} from '@src/types/onyx/Policy';

type ToggleCardContinuousReconciliationParams = {
    workspaceAccountID: number;
    shouldUseContinuousReconciliation: boolean;
    reconciliationSettings?: ReconciliationConnectionSettings;
};

export default ToggleCardContinuousReconciliationParams;
