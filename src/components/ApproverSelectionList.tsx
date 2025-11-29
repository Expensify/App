import React, {useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
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
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import BlockingView from './BlockingViews/BlockingView';
import FullPageNotFoundView from './BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from './HeaderWithBackButton';
import ScreenWrapper from './ScreenWrapper';
import SelectionList from './SelectionListWithSections';
import InviteMemberListItem from './SelectionListWithSections/InviteMemberListItem';
import type {Section} from './SelectionListWithSections/types';

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
};

type SelectionListApprover = {
    text: string;
    alternateText: string;
    keyForList: string;
    isSelected: boolean;
    login: string;
    rightElement?: React.ReactNode;
    icons: Icon[];
    value?: number;
};

type ApproverSection = SectionListData<SelectionListApprover, Section<SelectionListApprover>>;

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
}: ApproverSelectionListPageProps) {
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const shouldShowTextInput = shouldShowTextInputProp ?? allApprovers?.length >= CONST.STANDARD_LIST_ITEM_LIMIT;
    const lazyIllustrations = useMemoizedLazyIllustrations(['TurtleInShell']);

    const [selectedMembers, setSelectedMembers] = useState<SelectionListApprover[]>([]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy) || shouldShowNotFoundViewProp;

    const sections: ApproverSection[] = useMemo(() => {
        const filteredApprovers =
            debouncedSearchTerm !== ''
                ? tokenizedSearch(allApprovers, getSearchValueForPhoneOrEmail(debouncedSearchTerm, countryCode), (option) => [option.text ?? '', option.login ?? ''])
                : allApprovers;

        const data = sortAlphabetically(filteredApprovers, 'text', localeCompare);
        return [
            {
                title: undefined,
                data,
                shouldShow: true,
            },
        ];
    }, [allApprovers, debouncedSearchTerm, countryCode, localeCompare]);

    const shouldShowListEmptyContent = !debouncedSearchTerm && !sections.at(0)?.data.length && shouldShowListEmptyContentProp;

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
        setSelectedMembers(newSelectedApprovers);
        if (onSelectApprover) {
            onSelectApprover(newSelectedApprovers);
        }
    };

    const headerMessage = useMemo(() => (searchTerm && !sections.at(0)?.data?.length ? translate('common.noResultsFound') : ''), [searchTerm, sections, translate]);

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
                    canSelectMultiple={allowMultipleSelection}
                    sections={sections}
                    ListItem={InviteMemberListItem}
                    textInputLabel={shouldShowListEmptyContent ? undefined : translate('selectionList.findMember')}
                    textInputValue={searchTerm}
                    onChangeText={setSearchTerm}
                    headerMessage={headerMessage}
                    onSelectRow={toggleApprover}
                    showScrollIndicator
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    listEmptyContent={listEmptyContent}
                    shouldShowListEmptyContent={shouldShowListEmptyContent}
                    initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                    shouldUpdateFocusedIndex
                    shouldShowTextInput={shouldShowTextInput}
                    addBottomSafeAreaPadding
                    showLoadingPlaceholder={shouldShowLoadingPlaceholder}
                    footerContent={footerContent}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

ApproverSelectionList.displayName = 'ApproverSelectionList';

export default ApproverSelectionList;

export type {SelectionListApprover};
