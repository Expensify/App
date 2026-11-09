/**
 * Shared search, empty state, and list behavior for currency conversion fee account pickers.
 */
import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectionScreenProps} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useSelectionListSearch from '@hooks/useSelectionListSearch';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type {ReactNode} from 'react';

import React from 'react';

// Reuse the existing screen contract so each integration keeps its access rules, navigation, and feedback.
type FxExpenseAccountSelectPageProps = Pick<
    SelectionScreenProps,
    | 'policyID'
    | 'displayName'
    | 'title'
    | 'headerTitleAlreadyTranslated'
    | 'data'
    | 'connectionName'
    | 'accessVariants'
    | 'shouldBeBlocked'
    | 'pendingAction'
    | 'errors'
    | 'errorRowStyles'
    | 'onSelectRow'
    | 'onBackButtonPress'
    | 'onClose'
    | 'initiallyFocusedOptionKey'
    | 'confirmButtonOptions'
> & {
    children: ReactNode;
    emptyStateTitle: string;
    emptyStateSubtitle: string;
};

function FxExpenseAccountSelectPage({children, data, emptyStateTitle, emptyStateSubtitle, errorRowStyles, ...selectionScreenProps}: FxExpenseAccountSelectPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);
    const {filteredData, textInputOptions} = useSelectionListSearch(data, translate('common.noResultsFound'));

    return (
        <SelectionScreen
            {...selectionScreenProps}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            data={filteredData}
            textInputOptions={textInputOptions}
            headerContent={children}
            shouldSingleExecuteRowSelect
            shouldUpdateFocusedIndex
            listEmptyContent={
                <BlockingView
                    icon={illustrations.Telescope}
                    iconWidth={variables.emptyListIconWidth}
                    iconHeight={variables.emptyListIconHeight}
                    title={emptyStateTitle}
                    subtitle={emptyStateSubtitle}
                    containerStyle={styles.pb10}
                />
            }
            shouldShowListEmptyContent={!textInputOptions.value}
            errorRowStyles={errorRowStyles ?? [styles.ph5, styles.pv3]}
        />
    );
}

export default FxExpenseAccountSelectPage;
