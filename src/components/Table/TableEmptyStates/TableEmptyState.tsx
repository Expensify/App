import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import type {GenericEmptyStateComponentProps} from '@components/EmptyStateComponent/types';
import ScrollView from '@components/ScrollView';
import {useTableContext} from '@components/Table/TableContext';
import useThemeStyles from '@hooks/useThemeStyles';

export default function TableEmptyState(emptyStateProps: GenericEmptyStateComponentProps) {
    const styles = useThemeStyles();
    const {originalDataLength} = useTableContext();

    if (originalDataLength) {
        return null;
    }

    return (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <GenericEmptyStateComponent {...emptyStateProps} />
        </ScrollView>
    );
}
