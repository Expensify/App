import useDebouncedState from '@hooks/useDebouncedState';
import useInitialSelection from '@hooks/useInitialSelection';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import moveInitialSelectionToTop from '@libs/SelectionListOrderUtils';
import tokenizedSearch from '@libs/tokenizedSearch';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useCallback, useMemo} from 'react';

import type {ListItem} from './SelectionList/types';

import BlockingView from './BlockingViews/BlockingView';
import FullPageNotFoundView from './BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from './HeaderWithBackButton';
import ScreenWrapper from './ScreenWrapper';
import SelectionList from './SelectionList';
import InviteMemberListItem from './SelectionList/ListItem/InviteMemberListItem';

type ApproverSelectionListPageProps = {
    testID: string;
    headerTitle: string;
    policy?: Policy;
    isLoadingReportData?: boolean;
    onBackButtonPress: () => void;
    initiallyFocusedOptionKey?: string;
    shouldShowNotFoundView?: boolean;
    shouldShowNotFoundViewLink?: boolean;
    listEmptyContentSubtitle?: string;
    footerContent?: React.ReactNode;
    subtitle?: React.ReactNode;
    shouldShowTextInput?: boolean;
    allApprovers: SelectionListApprover[];
    shouldShowListEmptyContent?: boolean;
    allowMultipleSelection?: boolean;
    onSelectApprover?: (approvers: SelectionListApprover[]) => void;
    shouldShowLoadingPlaceholder?: boolean;
    shouldEnableHeaderMaxHeight?: boolean;
    onSearchChange?: (searchTerm: string) => void;
    shouldUpdateFocusedIndex?: boolean;
    shouldRequirePolicyAdmin?: boolean;
};

type SelectionListApprover = ListItem & {
    value?: number | string;
};

function ApproverSelectionList({
    testID,
    headerTitle,
    subtitle,
    isLoadingReportData,
    policy,
    onBackButtonPress,
    initiallyFocusedOptionKey,
    shouldShowTextInput: shouldShowTextInputProp,
    shouldShowNotFoundView: shouldShowNotFoundViewProp = false,
    shouldShowNotFoundViewLink = true,
    listEmptyContentSubtitle,
    footerContent = null,
    allApprovers,
    shouldShowListEmptyContent: shouldShowListEmptyContentProp = true,
    allowMultipleSelection = false,
    onSelectApprover,
    shouldShowLoadingPlaceholder,
    shouldEnableHeaderMaxHeight,
    onSearchChange,
    shouldUpdateFocusedIndex = true,
    shouldRequirePolicyAdmin = true,
}: ApproverSelectionListPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const shouldShowTextInput = shouldShowTextInputProp ?? allApprovers?.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const lazyIllustrations = useMemoizedLazyIllustrations(['TurtleInShell']);

    const handleSearchChange = useCallback(
        (term: string) => {
            setSearchTerm(term);
            if (onSearchChange) {
                onSearchChange(term);
            }
        },
        [onSearchChange, setSearchTerm],
    );

    const selectedMembers = useMemo(() => allApprovers.filter((approver) => approver.isSelected), [allApprovers]);
    const selectedApproverKeys = useMemo(() => selectedMembers.map((approver) => approver.value?.toString() ?? '').filter(Boolean), [selectedMembers]);
    const selectedApproverFocusKey = selectedMembers.at(0)?.keyForList;
    const currentFocusedApproverKey = initiallyFocusedOptionKey ?? selectedApproverFocusKey;
    const initialSelectionOptions = {isVisible: allApprovers.length > 0, resetOnFocus: true};
    const initialSelectedApproverKeys = useInitialSelection(selectedApproverKeys, initialSelectionOptions);
    const initiallyFocusedApproverKey = useInitialSelection(currentFocusedApproverKey, initialSelectionOptions);
    const selectionListKey = `${initiallyFocusedApproverKey ?? ''}-${initialSelectedApproverKeys.join(',')}`;

    const shouldShowNotFoundView =
        (isEmptyObject(policy) && !isLoadingReportData) || (shouldRequirePolicyAdmin && !isPolicyAdmin(policy)) || isPendingDeletePolicy(policy) || shouldShowNotFoundViewProp;

    const data = useMemo(() => {
        const filteredApprovers =
            debouncedSearchTerm !== ''
                ? tokenizedSearch(allApprovers, getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode), (option) => [option.text ?? '', option.login ?? ''])
                : allApprovers;

        const sortedApprovers = sortAlphabetically(filteredApprovers, 'text', localeCompare);

        if (debouncedSearchTerm) {
            return sortedApprovers;
        }

        return moveInitialSelectionToTop(sortedApprovers, initialSelectedApproverKeys);
    }, [allApprovers, debouncedSearchTerm, countryCode, localeCompare, initialSelectedApproverKeys]);

    const shouldShowListEmptyContent = !debouncedSearchTerm && !data.length && shouldShowListEmptyContentProp;

    const toggleApprover = (member: SelectionListApprover) => {
        const isAlreadySelected = selectedMembers.some((selectedOption) => selectedOption.login === member.login);
        let newSelectedApprovers = [];
        if (!allowMultipleSelection) {
            newSelectedApprovers = isAlreadySelected ? [] : [{...member, isSelected: true}];
        } else {
            newSelectedApprovers = isAlreadySelected
                ? selectedMembers.filter((selectedOption) => selectedOption.login !== member.login)
                : [...selectedMembers, {...member, isSelected: true}];
        }
        if (onSelectApprover) {
            onSelectApprover(newSelectedApprovers);
        }
    };

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={lazyIllustrations.TurtleInShell}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workflowsPage.emptyContent.title')}
                subtitle={listEmptyContentSubtitle}
                subtitleStyle={styles.textSupporting}
                containerStyle={styles.pb10}
                contentFitImage="contain"
            />
        ),
        [translate, listEmptyContentSubtitle, styles.textSupporting, styles.pb10, lazyIllustrations.TurtleInShell],
    );

    const textInputOptions = useMemo(
        () => ({
            label: shouldShowListEmptyContent ? undefined : translate('selectionList.findMember'),
            value: searchTerm,
            onChangeText: handleSearchChange,
            headerMessage: searchTerm && !data?.length ? translate('common.noResultsFound') : '',
        }),
        [shouldShowListEmptyContent, translate, searchTerm, handleSearchChange, data?.length],
    );

    return (
        <ScreenWrapper
            testID={testID}
            enableEdgeToEdgeBottomSafeAreaPadding
            shouldEnableMaxHeight={shouldEnableHeaderMaxHeight}
        >
            <FullPageNotFoundView
                shouldShow={shouldShowNotFoundView}
                subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                shouldShowLink={shouldShowNotFoundViewLink}
                onBackButtonPress={goBackFromInvalidPolicy}
                onLinkPress={goBackFromInvalidPolicy}
                addBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={headerTitle}
                    onBackButtonPress={onBackButtonPress}
                />
                {subtitle}
                <SelectionList
                    key={selectionListKey}
                    data={data}
                    onSelectRow={toggleApprover}
                    ListItem={InviteMemberListItem}
                    textInputOptions={textInputOptions}
                    canSelectMultiple={allowMultipleSelection}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    listEmptyContent={listEmptyContent}
                    shouldShowListEmptyContent={shouldShowListEmptyContent}
                    initiallyFocusedItemKey={initiallyFocusedApproverKey}
                    shouldShowTextInput={shouldShowTextInput}
                    shouldShowLoadingPlaceholder={shouldShowLoadingPlaceholder}
                    footerContent={footerContent}
                    addBottomSafeAreaPadding
                    shouldUpdateFocusedIndex={shouldUpdateFocusedIndex}
                    disableMaintainingScrollPosition
                    showScrollIndicator
                    isRowMultilineSupported
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default ApproverSelectionList;

export type {SelectionListApprover};
