import React, {createContext, useContext} from 'react';
import type {ViolationField} from '@hooks/useViolations';
import useViolations from '@hooks/useViolations';
import type {TransactionViolation} from '@src/types/onyx';

type SnapshotViolationsContextValue = {
    all: TransactionViolation[];
    getForField: (field: ViolationField) => TransactionViolation[];
};

const SnapshotViolationsContext = createContext<SnapshotViolationsContextValue | null>(null);

type SnapshotViolationsProviderProps = {
    violations: TransactionViolation[];
    shouldShowOnlyViolations?: boolean;
    children: React.ReactNode;
};

function SnapshotViolationsProvider({violations, shouldShowOnlyViolations = false, children}: SnapshotViolationsProviderProps) {
    const {getViolationsForField} = useViolations(violations, shouldShowOnlyViolations);

    const value: SnapshotViolationsContextValue = {
        all: violations,
        getForField: (field: ViolationField) => getViolationsForField(field),
    };

    return <SnapshotViolationsContext.Provider value={value}>{children}</SnapshotViolationsContext.Provider>;
}

function useSnapshotViolationsContext(): SnapshotViolationsContextValue {
    const ctx = useContext(SnapshotViolationsContext);
    if (!ctx) {
        throw new Error('SnapshotViolationsProvider missing');
    }
    return ctx;
}

function useHasFieldViolation(field: ViolationField): boolean {
    return useSnapshotViolationsContext().getForField(field).length > 0;
}

function useFieldViolationMessages(field: ViolationField): TransactionViolation[] {
    return useSnapshotViolationsContext().getForField(field);
}

function useAllViolations(): TransactionViolation[] {
    return useSnapshotViolationsContext().all;
}

export default SnapshotViolationsProvider;
export {useHasFieldViolation, useFieldViolationMessages, useAllViolations};
