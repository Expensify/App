import React from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import type {SelectorType} from '@components/SelectionScreen';
import SelectionScreen from '@components/SelectionScreen';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {ConnectionName} from '@src/types/onyx/Policy';
import type {ReceiptErrors} from '@src/types/onyx/Transaction';

type TravelInvoicingVendorSelectPageProps = {
    policyID: string;
    displayName: string;
    data: Array<SelectorType<string>>;
    connectionName: ConnectionName;
    emptyStateTitle: TranslationPaths;
    emptyStateSubtitle: TranslationPaths;
    pendingAction?: OnyxCommon.PendingAction | null;
    errors?: OnyxCommon.Errors | ReceiptErrors | null;
    onSelect: (row: SelectorType<string>) => void;
    onBack: () => void;
    onClose: () => void;
};

function TravelInvoicingVendorSelectPage({
    policyID,
    displayName,
    data,
    connectionName,
    emptyStateTitle,
    emptyStateSubtitle,
    pendingAction,
    errors,
    onSelect,
    onBack,
    onClose,
}: TravelInvoicingVendorSelectPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const listEmptyContent = (
        <BlockingView
            icon={illustrations.Telescope}
            iconWidth={variables.emptyListIconWidth}
            iconHeight={variables.emptyListIconHeight}
            title={translate(emptyStateTitle)}
            subtitle={translate(emptyStateSubtitle)}
            containerStyle={styles.pb10}
        />
    );

    return (
        <SelectionScreen
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
            displayName={displayName}
            title="workspace.common.travelInvoicingVendor"
            data={data}
            onSelectRow={onSelect}
            shouldSingleExecuteRowSelect
            initiallyFocusedOptionKey={data.find((option) => option.isSelected)?.keyForList}
            listEmptyContent={listEmptyContent}
            connectionName={connectionName}
            onBackButtonPress={onBack}
            pendingAction={pendingAction}
            errors={errors}
            errorRowStyles={[styles.ph5, styles.pv3]}
            onClose={onClose}
        />
    );
}

export default TravelInvoicingVendorSelectPage;
