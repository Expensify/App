import React, {useCallback, useMemo} from 'react';
import useDebouncedState from '@hooks/useDebouncedState';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import {getSearchValueForPhoneOrEmail, sortAlphabetically} from '@libs/OptionsListUtils';
import {goBackFromInvalidPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import BlockingView from './BlockingViews/BlockingView';
import FullPageNotFoundView from './BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from './HeaderWithBackButton';
import ScreenWrapper from './ScreenWrapper';
import SelectionList from './SelectionList';
import InviteMemberListItem from './SelectionList/ListItem/InviteMemberListItem';
import type {ListItem} from './SelectionList/types';

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
};

type SelectionListApprover = ListItem & {
    value?: number;
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
}: ApproverSelectionListPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
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

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy) || shouldShowNotFoundViewProp;

    const data = useMemo(() => {
        const filteredApprovers =
            debouncedSearchTerm !== ''
                ? tokenizedSearch(allApprovers, getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode), (option) => [option.text ?? '', option.login ?? ''])
                : allApprovers;

        return sortAlphabetically(filteredApprovers, 'text', localeCompare);
    }, [allApprovers, debouncedSearchTerm, countryCode, localeCompare]);

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
                    data={data}
                    onSelectRow={toggleApprover}
                    ListItem={InviteMemberListItem}
                    textInputOptions={textInputOptions}
                    canSelectMultiple={allowMultipleSelection}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    listEmptyContent={listEmptyContent}
                    showListEmptyContent={shouldShowListEmptyContent}
                    initiallyFocusedItemKey={initiallyFocusedOptionKey}
                    shouldShowTextInput={shouldShowTextInput}
                    showLoadingPlaceholder={shouldShowLoadingPlaceholder}
                    footerContent={footerContent}
                    addBottomSafeAreaPadding
                    shouldUpdateFocusedIndex={shouldUpdateFocusedIndex}
                    showScrollIndicator
                    isRowMultilineSupported
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default ApproverSelectionList;

export type {SelectionListApprover};
