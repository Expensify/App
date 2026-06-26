import GenericEmptyStateComponent from '@components/EmptyStateComponent/GenericEmptyStateComponent';
import type {GenericEmptyStateComponentProps} from '@components/EmptyStateComponent/types';
import ScrollView from '@components/ScrollView';
import {useTableContext} from '@components/Table/TableContext';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
import type IconAsset from '@src/types/utils/IconAsset';

type TableNoResultsStateProps = Omit<GenericEmptyStateComponentProps, 'headerMedia'> & {
    headerMedia?: IconAsset;
};

export default function TableNoResultsState(emptyStateProps: TableNoResultsStateProps) {
    const styles = useThemeStyles();
    const {processedData, originalDataLength} = useTableContext();
    const illustrations = useMemoizedLazyIllustrations(['EmptyShelves']);

    if (!originalDataLength || processedData.length) {
        return null;
    }

    return (
        <ScrollView contentContainerStyle={[styles.flexGrow1, styles.flexShrink0]}>
            <GenericEmptyStateComponent
                headerMedia={illustrations.EmptyShelves}
                {...emptyStateProps}
            />
        </ScrollView>
    );
}
