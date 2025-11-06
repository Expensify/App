import type {Ref} from 'react';
import React, {useEffect, useImperativeHandle, useMemo, useRef} from 'react';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionListWithSections';
import InviteMemberListItem from '@components/SelectionListWithSections/InviteMemberListItem';
import type {SelectionListHandle} from '@components/SelectionListWithSections/types';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';
import {getOptimisticChatReport, saveReportDraft, searchInServer} from '@libs/actions/Report';
import {clearUnknownUserDetails, saveUnknownUserDetails} from '@libs/actions/Share';
import Navigation from '@libs/Navigation/Navigation';
import {combineOrderingOfReportsAndPersonalDetails, getHeaderMessage, getSearchOptions, optionsOrderBy, recentReportComparator} from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const defaultListOptions = {
    userToInvite: null,
    recentReports: [],
    personalDetails: [],
    currentUserOption: null,
    categoryOptions: [],
};

type ShareTabRef = {
    focus?: () => void;
};

type ShareTabProps = {
    /** Reference to the outer element */
    ref?: Ref<ShareTabRef>;
};

function ShareTab({ref}: ShareTabProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [textInputValue, debouncedTextInputValue, setTextInputValue] = useDebouncedState('');
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});
    const selectionListRef = useRef<SelectionListHandle | null>(null);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});

    useImperativeHandle(ref, () => ({
        focus: selectionListRef.current?.focusTextInput,
    }));

    const {options, areOptionsInitialized} = useOptionsList();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});

    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';
    const showLoadingPlaceholder = useMemo(() => !areOptionsInitialized || !didScreenTransitionEnd, [areOptionsInitialized, didScreenTransitionEnd]);

    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return getSearchOptions({
            options,
            draftComments,
            betas: betas ?? [],
            isUsedInChatFinder: false,
            includeReadOnly: false,
            searchQuery: textInputValue,
            maxResults: 20,
            includeUserToInvite: true,
            countryCode,
        });
    }, [areOptionsInitialized, betas, draftComments, options, textInputValue, countryCode]);

    const recentReportsOptions = useMemo(() => {
        if (textInputValue.trim() === '') {
            return optionsOrderBy(searchOptions.recentReports, recentReportComparator, 20);
        }
        const orderedOptions = combineOrderingOfReportsAndPersonalDetails(searchOptions, textInputValue, {
            sortByReportTypeInSearch: true,
            preferChatRoomsOverThreads: true,
        });

        const reportOptions: OptionData[] = [...orderedOptions.recentReports, ...orderedOptions.personalDetails];
        if (searchOptions.userToInvite) {
            reportOptions.push(searchOptions.userToInvite);
        }
        return reportOptions.slice(0, 20);
    }, [searchOptions, textInputValue]);

    useEffect(() => {
        searchInServer(debouncedTextInputValue.trim());
    }, [debouncedTextInputValue]);

    const styledRecentReports = recentReportsOptions.map((item) => ({
        ...item,
        pressableStyle: styles.br2,
        text: StringUtils.lineBreaksToSpaces(item.text),
        wrapperStyle: [styles.pr3, styles.pl3],
    }));

    const [sections, header] = useMemo(() => {
        const newSections = [];
        newSections.push({title: textInputValue.trim() === '' ? translate('search.recentChats') : undefined, data: styledRecentReports});
        const headerMessage = getHeaderMessage(styledRecentReports.length !== 0, false, textInputValue.trim(), countryCode, false);
        return [newSections, headerMessage];
    }, [textInputValue, styledRecentReports, translate, countryCode]);

    const onSelectRow = (item: OptionData) => {
        let reportID = item?.reportID ?? CONST.DEFAULT_NUMBER_ID;
        const accountID = item?.accountID;
        if (accountID && !reportID) {
            saveUnknownUserDetails(item);
            const optimisticReport = getOptimisticChatReport(accountID);
            reportID = optimisticReport.reportID;

            saveReportDraft(reportID, optimisticReport).then(() => {
                Navigation.navigate(ROUTES.SHARE_DETAILS.getRoute(reportID.toString()));
            });
        } else {
            clearUnknownUserDetails();
            Navigation.navigate(ROUTES.SHARE_DETAILS.getRoute(reportID.toString()));
        }
    };

    return (
        <SelectionList
            sections={areOptionsInitialized ? sections : CONST.EMPTY_ARRAY}
            textInputValue={textInputValue}
            textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
            textInputHint={offlineMessage}
            onChangeText={setTextInputValue}
            headerMessage={header}
            sectionListStyle={[styles.ph2, styles.pb2, styles.overscrollBehaviorContain]}
            ListItem={InviteMemberListItem}
            showLoadingPlaceholder={showLoadingPlaceholder}
            shouldSingleExecuteRowSelect
            onSelectRow={onSelectRow}
            isLoadingNewOptions={!!isSearchingForReports}
            textInputAutoFocus={false}
            ref={selectionListRef}
        />
    );
}

export default ShareTab;
