import React, {useMemo} from 'react';
import type {StyleProp, TextStyle} from 'react-native';
import {View} from 'react-native';
import ButtonWithDropdownMenu from '@components/ButtonWithDropdownMenu';
import type {DropdownOption} from '@components/ButtonWithDropdownMenu/types';
import Header from '@components/Header';
import type HeaderWithBackButtonProps from '@components/HeaderWithBackButton/types';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as SearchActions from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import * as SearchUtils from '@libs/SearchUtils';
import SearchSelectedNarrow from '@pages/Search/SearchSelectedNarrow';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ROUTES from '@src/ROUTES';
import type {SearchReport} from '@src/types/onyx/SearchResults';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import type IconAsset from '@src/types/utils/IconAsset';
import {useSearchContext} from './SearchContext';
import type {SearchQueryJSON, SearchStatus, SelectedTransactions} from './types';

type HeaderWrapperProps = Pick<HeaderWithBackButtonProps, 'title' | 'subtitle' | 'icon' | 'children'> & {
    subtitleStyles?: StyleProp<TextStyle>;
};

function HeaderWrapper({icon, title, subtitle, children, subtitleStyles = {}}: HeaderWrapperProps) {
    const styles = useThemeStyles();

    // If the icon is present, the header bar should be taller and use different font.
    const isCentralPaneSettings = !!icon;

    const middleContent = useMemo(() => {
        return (
            <Header
                title={
                    <Text
                        style={[styles.mutedTextLabel, styles.pre]}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                }
                subtitle={
                    <Text
                        numberOfLines={2}
                        style={[styles.textLarge, subtitleStyles]}
                    >
                        {subtitle}
                    </Text>
                }
            />
        );
    }, [styles.mutedTextLabel, styles.pre, styles.textLarge, subtitle, subtitleStyles, title]);

    return (
        <View
            dataSet={{dragArea: false}}
            style={[styles.headerBar, isCentralPaneSettings && styles.headerBarDesktopHeight]}
        >
            <View style={[styles.dFlex, styles.flexRow, styles.alignItemsCenter, styles.flexGrow1, styles.justifyContentBetween, styles.overflowHidden]}>
                {icon && (
                    <Icon
                        src={icon}
                        width={variables.iconHeader}
                        height={variables.iconHeader}
                        additionalStyles={[styles.mr2]}
                    />
                )}

                {middleContent}
                <View style={[styles.reportOptions, styles.flexRow, styles.pr5, styles.alignItemsCenter]}>{children}</View>
            </View>
        </View>
    );
}

type SearchPageHeaderProps = {
    queryJSON: SearchQueryJSON;
    selectedTransactions?: SelectedTransactions;
    selectedReports?: Array<SearchReport['reportID']>;
    clearSelectedItems?: () => void;
    hash: number;
    onSelectDeleteOption?: (itemsToDelete: string[]) => void;
    isMobileSelectionModeActive?: boolean;
    setIsMobileSelectionModeActive?: (isMobileSelectionModeActive: boolean) => void;
    isCustomQuery?: boolean;
    setOfflineModalOpen?: () => void;
    setDownloadErrorModalOpen?: () => void;
};

type SearchHeaderOptionValue = DeepValueOf<typeof CONST.SEARCH.BULK_ACTION_TYPES> | undefined;

const headerContent: {[key in SearchStatus]: {icon: IconAsset; titleTx: TranslationPaths}} = {
    all: {icon: Illustrations.MoneyReceipts, titleTx: 'common.expenses'},
    shared: {icon: Illustrations.SendMoney, titleTx: 'common.shared'},
    drafts: {icon: Illustrations.Pencil, titleTx: 'common.drafts'},
    finished: {icon: Illustrations.CheckmarkCircle, titleTx: 'common.finished'},
};

function SearchPageHeader({
    queryJSON,
    selectedTransactions = {},
    hash,
    clearSelectedItems,
    onSelectDeleteOption,
    isMobileSelectionModeActive,
    setIsMobileSelectionModeActive,
    isCustomQuery = false,
    setOfflineModalOpen,
    setDownloadErrorModalOpen,
    selectedReports,
}: SearchPageHeaderProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();
    const {activeWorkspaceID} = useActiveWorkspace();
    const {isSmallScreenWidth} = useResponsiveLayout();
    const {setSelectedTransactionIDs} = useSearchContext();
    const {status, input} = queryJSON;
    const headerSubtitle = isCustomQuery ? SearchUtils.getSearchHeaderTitle(input) : translate(headerContent[status]?.titleTx);
    const headerTitle = isCustomQuery ? translate('search.filtersHeader') : '';
    const headerIcon = isCustomQuery ? Illustrations.Filters : headerContent[status]?.icon;

    const selectedTransactionsKeys = Object.keys(selectedTransactions ?? []);

    const subtitleStyles = isCustomQuery ? {} : styles.textHeadlineH2;

    const headerButtonsOptions = useMemo(() => {
        if (selectedTransactionsKeys.length === 0) {
            return [];
        }

        const options: Array<DropdownOption<SearchHeaderOptionValue>> = [];

        options.push({
            icon: Expensicons.Download,
            text: translate('common.download'),
            value: CONST.SEARCH.BULK_ACTION_TYPES.EXPORT,
            shouldCloseModalOnSelect: true,
            onSelected: () => {
                if (isOffline) {
                    setOfflineModalOpen?.();
                    return;
                }

                const reportIDList = (selectedReports?.filter((report) => !!report) as string[]) ?? [];
                SearchActions.exportSearchItemsToCSV({query: status, reportIDList, transactionIDList: selectedTransactionsKeys, policyIDs: [activeWorkspaceID ?? '']}, () => {
                    setDownloadErrorModalOpen?.();
                });
            },
        });

        const shouldShowHoldOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canHold);

        if (shouldShowHoldOption) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.hold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.HOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setOfflineModalOpen?.();
                        return;
                    }

                    clearSelectedItems?.();
                    if (isMobileSelectionModeActive) {
                        setIsMobileSelectionModeActive?.(false);
                    }
                    setSelectedTransactionIDs(selectedTransactionsKeys);
                    Navigation.navigate(ROUTES.TRANSACTION_HOLD_REASON_RHP);
                },
            });
        }

        const shouldShowUnholdOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canUnhold);

        if (shouldShowUnholdOption) {
            options.push({
                icon: Expensicons.Stopwatch,
                text: translate('search.bulkActions.unhold'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.UNHOLD,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setOfflineModalOpen?.();
                        return;
                    }

                    clearSelectedItems?.();
                    if (isMobileSelectionModeActive) {
                        setIsMobileSelectionModeActive?.(false);
                    }
                    SearchActions.unholdMoneyRequestOnSearch(hash, selectedTransactionsKeys);
                },
            });
        }

        const shouldShowDeleteOption = !isOffline && selectedTransactionsKeys.every((id) => selectedTransactions[id].canDelete);

        if (shouldShowDeleteOption) {
            options.push({
                icon: Expensicons.Trashcan,
                text: translate('search.bulkActions.delete'),
                value: CONST.SEARCH.BULK_ACTION_TYPES.DELETE,
                shouldCloseModalOnSelect: true,
                onSelected: () => {
                    if (isOffline) {
                        setOfflineModalOpen?.();
                        return;
                    }

                    onSelectDeleteOption?.(selectedTransactionsKeys);
                },
            });
        }

        if (options.length === 0) {
            const emptyOptionStyle = {
                interactive: false,
                iconFill: theme.icon,
                iconHeight: variables.iconSizeLarge,
                iconWidth: variables.iconSizeLarge,
                numberOfLinesTitle: 2,
                titleStyle: {...styles.colorMuted, ...styles.fontWeightNormal, ...styles.textWrap},
            };

            options.push({
                icon: Expensicons.Exclamation,
                text: translate('search.bulkActions.noOptionsAvailable'),
                value: undefined,
                ...emptyOptionStyle,
            });
        }

        return options;
    }, [
        status,
        selectedTransactionsKeys,
        selectedTransactions,
        translate,
        onSelectDeleteOption,
        clearSelectedItems,
        isMobileSelectionModeActive,
        hash,
        setIsMobileSelectionModeActive,
        theme.icon,
        styles.colorMuted,
        styles.fontWeightNormal,
        isOffline,
        setOfflineModalOpen,
        setDownloadErrorModalOpen,
        activeWorkspaceID,
        selectedReports,
        styles.textWrap,
        setSelectedTransactionIDs,
    ]);

    if (isSmallScreenWidth) {
        if (isMobileSelectionModeActive) {
            return (
                <SearchSelectedNarrow
                    options={headerButtonsOptions}
                    itemsLength={selectedTransactionsKeys.length}
                />
            );
        }
        return null;
    }

    return (
        <HeaderWrapper
            title={headerTitle}
            subtitle={headerSubtitle}
            icon={headerIcon}
            subtitleStyles={subtitleStyles}
        >
            {headerButtonsOptions.length > 0 && (
                <ButtonWithDropdownMenu
                    onPress={() => null}
                    shouldAlwaysShowDropdownMenu
                    pressOnEnter
                    buttonSize={CONST.DROPDOWN_BUTTON_SIZE.MEDIUM}
                    customText={translate('workspace.common.selected', {selectedNumber: selectedTransactionsKeys.length})}
                    options={headerButtonsOptions}
                    isSplitButton={false}
                    style={styles.ml2}
                />
            )}
        </HeaderWrapper>
    );
}

SearchPageHeader.displayName = 'SearchPageHeader';

export type {SearchHeaderOptionValue};
export default SearchPageHeader;
