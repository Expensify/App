import React, {useEffect, useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import {useOptionsList} from '@components/OptionListContextProvider';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useDebouncedState from '@hooks/useDebouncedState';
import useFastSearchFromOptions from '@hooks/useFastSearchFromOptions';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useScreenWrapperTransitionStatus from '@hooks/useScreenWrapperTransitionStatus';
import useThemeStyles from '@hooks/useThemeStyles';
import {getOptimisticChatReport, saveReportDraft, searchInServer} from '@libs/actions/Report';
import {saveUnknownUserDetails} from '@libs/actions/Share';
import Navigation from '@libs/Navigation/Navigation';
import {combineOrderingOfReportsAndPersonalDetails, getHeaderMessage, getSearchOptions} from '@libs/OptionsListUtils';
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

function ShareTab() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const [textInputValue, debouncedTextInputValue, setTextInputValue] = useDebouncedState('');
    const [betas] = useOnyx(ONYXKEYS.BETAS, {canBeMissing: true});

    const {options, areOptionsInitialized} = useOptionsList();
    const {didScreenTransitionEnd} = useScreenWrapperTransitionStatus();
    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: true});

    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';
    const showLoadingPlaceholder = useMemo(() => !areOptionsInitialized || !didScreenTransitionEnd, [areOptionsInitialized, didScreenTransitionEnd]);

    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }
        return getSearchOptions(options, betas ?? [], false, false);
    }, [areOptionsInitialized, betas, options]);

    const filterOptions = useFastSearchFromOptions(searchOptions, {includeUserToInvite: true});

    const recentReportsOptions = useMemo(() => {
        if (textInputValue.trim() === '') {
            return searchOptions.recentReports.slice(0, 20);
        }
        const filteredOptions = filterOptions(textInputValue);
        const orderedOptions = combineOrderingOfReportsAndPersonalDetails(filteredOptions, textInputValue, {
            sortByReportTypeInSearch: true,
            preferChatRoomsOverThreads: true,
        });

        const reportOptions: OptionData[] = [...orderedOptions.recentReports, ...orderedOptions.personalDetails];
        if (filteredOptions.userToInvite) {
            reportOptions.push(filteredOptions.userToInvite);
        }
        return reportOptions.slice(0, 20);
    }, [filterOptions, searchOptions.recentReports, textInputValue]);

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
        const headerMessage = getHeaderMessage(styledRecentReports.length !== 0, false, textInputValue.trim(), false);
        return [newSections, headerMessage];
    }, [textInputValue, styledRecentReports, translate]);

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
        />
    );
}

export default ShareTab;
