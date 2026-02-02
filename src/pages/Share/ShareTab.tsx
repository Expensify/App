import type {Ref} from 'react';
import React, {useEffect, useImperativeHandle, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/ListItem/InviteMemberListItem';
import type {ListItem, SelectionListHandle} from '@components/SelectionList/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
    const selectionListRef = useRef<SelectionListHandle<ListItem> | null>(null);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [draftComments] = useOnyx(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, {canBeMissing: true});
    const [nvpDismissedProductTraining] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const currentUserAccountID = currentUserPersonalDetails.accountID;
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    useImperativeHandle(ref, () => ({
        focus: selectionListRef.current?.focusTextInput,
    }));

    const {options, areOptionsInitialized} = useOptionsList();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});

    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';
    const showLoadingPlaceholder = useMemo(() => !areOptionsInitialized || !didScreenTransitionEnd, [areOptionsInitialized, didScreenTransitionEnd]);

    const [reports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: true});
    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return getSearchOptions({
            options,
            draftComments,
            nvpDismissedProductTraining,
            betas: betas ?? [],
            isUsedInChatFinder: false,
            includeReadOnly: false,
            searchQuery: textInputValue,
            maxResults: 20,
            includeUserToInvite: true,
            countryCode,
            loginList,
            visibleReportActionsData,
            currentUserAccountID,
            currentUserEmail,
            reports,
        });
    }, [
        areOptionsInitialized,
        options,
        draftComments,
        nvpDismissedProductTraining,
        betas,
        textInputValue,
        countryCode,
        loginList,
        visibleReportActionsData,
        currentUserAccountID,
        reports,
        currentUserEmail,
    ]);

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

    const styledRecentReports = useMemo(() => {
        return recentReportsOptions.map((item, index) => ({
            ...item,
            pressableStyle: styles.br2,
            text: StringUtils.lineBreaksToSpaces(item.text),
            wrapperStyle: [styles.pr3, styles.pl3],
            keyForList: `${item.reportID}-${index}`,
        }));
    }, [recentReportsOptions, styles]);

    const header = useMemo(() => {
        const headerMessage = getHeaderMessage(styledRecentReports.length !== 0, false, textInputValue.trim(), countryCode, false);
        return headerMessage;
    }, [textInputValue, styledRecentReports.length, countryCode]);

    const onSelectRow = (item: OptionData) => {
        let reportID = item?.reportID ?? CONST.DEFAULT_NUMBER_ID;
        const accountID = item?.accountID;
        if (accountID && !reportID) {
            saveUnknownUserDetails(item);
            const optimisticReport = getOptimisticChatReport(accountID, currentUserAccountID);
            reportID = optimisticReport.reportID;

            saveReportDraft(reportID, optimisticReport).then(() => {
                Navigation.navigate(ROUTES.SHARE_DETAILS.getRoute(reportID.toString()));
            });
        } else {
            clearUnknownUserDetails();
            Navigation.navigate(ROUTES.SHARE_DETAILS.getRoute(reportID.toString()));
        }
    };

    const textInputOptions = useMemo(
        () => ({
            value: textInputValue,
            label: translate('selectionList.nameEmailOrPhoneNumber'),
            hint: offlineMessage,
            onChangeText: setTextInputValue,
            headerMessage: header,
            disableAutoFocus: true,
        }),
        [textInputValue, setTextInputValue, translate, offlineMessage, header],
    );

    const customListHeader = useMemo(
        () =>
            textInputValue.trim() === '' ? (
                <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                    <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('search.recentChats')}</Text>
                </View>
            ) : undefined,
        [textInputValue, styles, translate],
    );

    return (
        <SelectionList
            data={areOptionsInitialized ? styledRecentReports : (CONST.EMPTY_ARRAY as unknown as never[])}
            customListHeaderContent={customListHeader}
            textInputOptions={textInputOptions}
            style={{listStyle: [styles.ph2, styles.pb2, styles.overscrollBehaviorContain]}}
            ListItem={InviteMemberListItem}
            showLoadingPlaceholder={showLoadingPlaceholder}
            shouldSingleExecuteRowSelect
            onSelectRow={onSelectRow}
            isLoadingNewOptions={!!isSearchingForReports}
            ref={selectionListRef}
        />
    );
}

export default ShareTab;
