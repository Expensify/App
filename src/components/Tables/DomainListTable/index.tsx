import type {CompareItemsCallback, IsItemInSearchCallback, TableColumn} from '@components/Table';
import Table, {composeTableListHeader} from '@components/Table';
import {getBadgeChromeWidth, getBadgeColumnDragMinWidth, measureBadgeLabelWidth} from '@components/Table/badgeCellWidths';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';

import {fontScale} from '@styles/typography';
import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {ValueOf} from 'type-fest';

import React from 'react';

import DomainListTableRow from './DomainListTableRow';

type DomainTableColumnKey = 'domains' | 'actions';

type DomainRowData = {
    keyForList: string;
    domainAccountID: number;
    title: string;
    disabled: boolean;
    isAdmin: boolean;
    isValidated: boolean;
    pendingAction?: OnyxCommon.PendingAction;
    errors?: OnyxCommon.Errors;
    brickRoadIndicator?: ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>;
    action: () => void;
};

type DomainListTableProps = {
    domains: DomainRowData[];
    headerComponent?: React.ReactElement;
};

export default function DomainListTable({domains, headerComponent}: DomainListTableProps) {
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['EarthWithControls']);
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();

    const shouldUseNarrowTableLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    const verifiedBadgeLabel = translate('common.verified');
    const unverifiedBadgeLabel = translate('domain.notVerified');
    const hasVerificationBadge = domains.some((domain) => domain.isAdmin);
    const domainIconExtraWidth = styles.domainIcon.width + styles.gap3.gap;
    // Admins see a verification badge after the domain.
    const verificationBadgeExtraWidth = hasVerificationBadge ? getBadgeChromeWidth(styles) : 0;
    const verificationBadgeWidths = hasVerificationBadge ? [measureBadgeLabelWidth(verifiedBadgeLabel), measureBadgeLabelWidth(unverifiedBadgeLabel)] : [];

    const domainTableColumns: Array<TableColumn<DomainTableColumnKey, DomainRowData>> = [
        {
            sortable: true,
            key: 'domains',
            label: translate('common.domains'),
            dynamicSizing: {
                // Admin rows render the verification badge after the domain, so that label is measured with the domain
                // and extraWidth covers the gap and the badge's padding and border.
                getContentToMeasure: (item) => {
                    if (!item.isAdmin) {
                        return [{text: item.title, fontSize: fontScale.text}];
                    }
                    return [{text: `${item.title}${item.isValidated ? verifiedBadgeLabel : unverifiedBadgeLabel}`, fontSize: fontScale.text}];
                },
                extraWidth: domainIconExtraWidth + verificationBadgeExtraWidth,
                dragMinWidth: getBadgeColumnDragMinWidth(styles, domainIconExtraWidth, verificationBadgeWidths),
            },
        },
        {
            sortable: false,
            key: 'actions',
            width: variables.domainTableActionColumnWidth,
            label: '',
            styling: {containerStyles: [styles.justifyContentEnd, styles.pr3]},
        },
    ];

    const compareTableItems: CompareItemsCallback<DomainRowData> = (item1, item2, activeSorting) => {
        const orderMultiplier = activeSorting.order === 'asc' ? 1 : -1;
        return orderMultiplier * localeCompare(item1.title, item2.title);
    };

    const isTableItemInSearch: IsItemInSearchCallback<DomainRowData> = (item, searchValue) => {
        return item.title.toLowerCase().includes(searchValue.toLowerCase());
    };

    const searchBarComponent = <Table.FilterBar label={translate('workspace.common.findDomain')} />;
    const tableHeaderComponent = composeTableListHeader(headerComponent, searchBarComponent);

    const renderTableItem = ({item, index}: ListRenderItemInfo<DomainRowData>) => {
        return (
            <DomainListTableRow
                item={item}
                rowIndex={index}
                shouldUseNarrowTableLayout={shouldUseNarrowTableLayout}
            />
        );
    };

    const emptyStateButtons = [
        {
            buttonVariant: CONST.BUTTON_VARIANT.SUCCESS,
            buttonAction: () => interceptAnonymousUser(() => Navigation.navigate(ROUTES.WORKSPACES_ADD_DOMAIN), session),
            buttonText: translate('domain.addDomain.newDomain'),
            sentryLabel: CONST.SENTRY_LABEL.DOMAIN.LIST.EMPTY_STATE_NEW_DOMAIN,
        },
    ];

    return (
        <Table
            shouldUseDynamicColumns
            columnResizingID={CONST.TABLES.COLUMN_RESIZING_IDS.DOMAIN_LIST}
            data={domains}
            columns={domainTableColumns}
            renderItem={renderTableItem}
            compareItems={compareTableItems}
            isItemInSearch={isTableItemInSearch}
            initialSortColumn="domains"
            title={translate('common.domains')}
            keyExtractor={(row, index) => `${row.domainAccountID}-${index}`}
        >
            <Table.ListHeader>{tableHeaderComponent}</Table.ListHeader>
            <Table.EmptyState
                headerMedia={illustrations.EarthWithControls}
                headerContentStyles={styles.emptyDomainListStaticIllustrationStyle}
                title={translate('workspace.emptyDomain.title')}
                subtitle={translate('workspace.emptyDomain.subtitle')}
                titleStyles={styles.pt2}
                headerStyles={styles.emptyStateCardIllustrationContainer}
                containerStyles={styles.mb10}
                buttons={emptyStateButtons}
            />
            <Table.NoResultsState />
            <Table.Header />
            <Table.Body />
        </Table>
    );
}

export type {DomainRowData};
