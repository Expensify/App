import type {StackScreenProps} from '@react-navigation/stack';
import isEmpty from 'lodash/isEmpty';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import useCancelSearchOnModalClose from '@hooks/useCancelSearchOnModalClose';
import useDebouncedState from '@hooks/useDebouncedState';
import useDismissedReferralBanners from '@hooks/useDismissedReferralBanners';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@libs/Navigation/Navigation';
import type {RootStackParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Performance from '@libs/Performance';
import type {OptionData} from '@libs/ReportUtils';
import {makeTree} from '@libs/SuffixUkkonenTree';
import * as Report from '@userActions/Report';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import ChatFinderPageFooter from './ChatFinderPageFooter';

type ChatFinderPageOnyxProps = {
    /** Beta features list */
    betas: OnyxEntry<OnyxTypes.Beta[]>;

    /** Whether or not we are searching for reports on the server */
    isSearchingForReports: OnyxEntry<boolean>;
};

type ChatFinderPageProps = ChatFinderPageOnyxProps & StackScreenProps<RootStackParamList, typeof SCREENS.LEFT_MODAL.CHAT_FINDER>;

type ChatFinderPageSectionItem = {
    data: OptionData[];
    shouldShow: boolean;
};

type ChatFinderPageSectionList = ChatFinderPageSectionItem[];

const setPerformanceTimersEnd = () => {
    Timing.end(CONST.TIMING.CHAT_FINDER_RENDER);
    Performance.markEnd(CONST.TIMING.CHAT_FINDER_RENDER);
};

const ChatFinderPageFooterInstance = <ChatFinderPageFooter />;

const aToZRegex = /[^a-z]/gi;

function ChatFinderPage({betas, isSearchingForReports, navigation}: ChatFinderPageProps) {
    const [isScreenTransitionEnd, setIsScreenTransitionEnd] = useState(false);
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const {options, areOptionsInitialized} = useOptionsList({
        shouldInitialize: isScreenTransitionEnd,
    });

    const offlineMessage: string = isOffline ? `${translate('common.youAppearToBeOffline')} ${translate('search.resultsAreLimited')}` : '';

    const [searchValue, debouncedSearchValue, setSearchValue] = useDebouncedState('');
    const [, debouncedSearchValueInServer, setSearchValueInServer] = useDebouncedState('', 500);
    const updateSearchValue = useCallback(
        (value: string) => {
            setSearchValue(value);
            setSearchValueInServer(value);
        },
        [setSearchValue, setSearchValueInServer],
    );
    useCancelSearchOnModalClose();

    useEffect(() => {
        Report.searchInServer(debouncedSearchValueInServer.trim());
    }, [debouncedSearchValueInServer]);

    const searchOptions = useMemo(() => {
        if (!areOptionsInitialized || !isScreenTransitionEnd) {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
                currentUserOption: null,
                categoryOptions: [],
                tagOptions: [],
                taxRatesOptions: [],
                headerMessage: '',
            };
        }
        const optionList = OptionsListUtils.getSearchOptions(options, '', betas ?? []);
        const header = OptionsListUtils.getHeaderMessage(optionList.recentReports.length + optionList.personalDetails.length !== 0, !!optionList.userToInvite, '');
        return {...optionList, headerMessage: header};
    }, [areOptionsInitialized, betas, isScreenTransitionEnd, options]);

    /**
     * Builds a suffix tree and returns a function to search in it.
     *
     * // TODO:
     * - The results we get from tree.findSubstring are the indexes of the occurrence in the original string
     *   I implemented a manual mapping function here, we probably want to put that inside the tree implementation
     *   (including the implementation detail of the delimiter character)
     */
    const findInSearchTree = useMemo(() => {
        // The character that separates the different options in the search string
        const delimiterChar = '{';

        const searchIndexListRecentReports: Array<OptionData | undefined> = [];
        const searchIndexListPersonalDetails: Array<OptionData | undefined> = [];

        let start = performance.now();
        let searchString = searchOptions.personalDetails
            .map((option) => {
                // TODO: there are probably more fields we'd like to add to the search string
                let searchStringForTree = (option.login ?? '') + (option.login !== option.displayName ? option.displayName ?? '' : '');
                // Remove all none a-z chars:
                searchStringForTree = searchStringForTree.toLowerCase().replace(aToZRegex, '');

                if (searchStringForTree.length > 0) {
                    // We need to push an array that has the same length as the length of the string we insert for this option:
                    const indexes = Array.from({length: searchStringForTree.length}, () => option);
                    // Note: we add undefined for the delimiter character
                    searchIndexListPersonalDetails.push(...indexes, undefined);
                } else {
                    return undefined;
                }

                return searchStringForTree;
            })
            .filter(Boolean)
            .join(delimiterChar);
        searchString += searchOptions.recentReports
            .map((option) => {
                let searchStringForTree = (option.login ?? '') + (option.login !== option.displayName ? option.displayName ?? '' : '');
                searchStringForTree += option.reportID ?? '';
                searchStringForTree += option.name ?? '';
                // Remove all none a-z chars:
                searchStringForTree = searchStringForTree.toLowerCase().replace(aToZRegex, '');

                if (searchStringForTree.length > 0) {
                    // We need to push an array that has the same length as the length of the string we insert for this option:
                    const indexes = Array.from({length: searchStringForTree.length}, () => option);
                    searchIndexListRecentReports.push(...indexes, undefined);
                } else {
                    return undefined;
                }

                return searchStringForTree;
            })
            // TODO: this can probably improved by a reduce
            .filter(Boolean)
            .join(delimiterChar);
        searchString += '|'; // End Character
        console.log(searchIndexListPersonalDetails.slice(0, 20));
        console.log(searchString.substring(0, 20));
        console.log('building search strings', performance.now() - start);

        start = performance.now();
        const tree = makeTree(searchString);
        console.log('makeTree', performance.now() - start);
        start = performance.now();
        tree.build();
        console.log('build', performance.now() - start);

        function search(searchInput: string) {
            start = performance.now();
            const result = tree.findSubstring(searchInput);
            console.log('FindSubstring index result for searchInput', searchInput, result);
            // Map the results to the original options
            const mappedResults = {
                personalDetails: [] as OptionData[],
                recentReports: [] as OptionData[],
            };
            result.forEach((index) => {
                // const textInSearchString = searchString.substring(index, searchString.indexOf(delimiterChar, index));
                // console.log('textInSearchString', textInSearchString);

                if (index < searchIndexListPersonalDetails.length) {
                    const option = searchIndexListPersonalDetails[index];
                    if (option) {
                        mappedResults.personalDetails.push(option);
                    }
                } else {
                    const option = searchIndexListRecentReports[index - searchIndexListPersonalDetails.length];
                    if (option) {
                        mappedResults.recentReports.push(option);
                    }
                }
            });

            console.log('search', performance.now() - start);
            return mappedResults;
        }

        return search;
    }, [searchOptions.personalDetails, searchOptions.recentReports]);

    const filteredOptions = useMemo(() => {
        if (debouncedSearchValue.trim() === '') {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
                headerMessage: '',
            };
        }

        Timing.start(CONST.TIMING.SEARCH_FILTER_OPTIONS);
        const newOptions = findInSearchTree(debouncedSearchValue.toLowerCase().replace(aToZRegex, ''));
        Timing.end(CONST.TIMING.SEARCH_FILTER_OPTIONS);

        const header = OptionsListUtils.getHeaderMessage(newOptions.recentReports.length > 0, false, debouncedSearchValue);
        return {
            recentReports: newOptions.recentReports,
            personalDetails: newOptions.personalDetails,
            userToInvite: undefined, // newOptions.userToInvite,
            headerMessage: header,
        };
    }, [debouncedSearchValue, findInSearchTree]);

    const {recentReports, personalDetails: localPersonalDetails, userToInvite, headerMessage} = debouncedSearchValue.trim() !== '' ? filteredOptions : searchOptions;

    const sections = useMemo((): ChatFinderPageSectionList => {
        const newSections: ChatFinderPageSectionList = [];

        if (recentReports?.length > 0) {
            newSections.push({
                data: recentReports,
                shouldShow: true,
            });
        }

        if (localPersonalDetails.length > 0) {
            newSections.push({
                data: localPersonalDetails,
                shouldShow: true,
            });
        }

        if (!isEmpty(userToInvite)) {
            newSections.push({
                data: [userToInvite],
                shouldShow: true,
            });
        }

        return newSections;
    }, [localPersonalDetails, recentReports, userToInvite]);

    const selectReport = (option: OptionData) => {
        if (!option) {
            return;
        }

        if (option.reportID) {
            Navigation.closeAndNavigate(ROUTES.REPORT_WITH_ID.getRoute(option.reportID));
        } else {
            Report.navigateToAndOpenReport(option.login ? [option.login] : []);
        }
    };

    const handleScreenTransitionEnd = () => {
        setIsScreenTransitionEnd(true);
    };

    const {isDismissed} = useDismissedReferralBanners({referralContentType: CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND});

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={ChatFinderPage.displayName}
            onEntryTransitionEnd={handleScreenTransitionEnd}
            shouldEnableMaxHeight
            navigation={navigation}
        >
            <HeaderWithBackButton
                title={translate('common.find')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList<OptionData>
                sections={areOptionsInitialized ? sections : CONST.EMPTY_ARRAY}
                ListItem={UserListItem}
                textInputValue={searchValue}
                textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                textInputHint={offlineMessage}
                onChangeText={updateSearchValue}
                headerMessage={headerMessage}
                onLayout={setPerformanceTimersEnd}
                onSelectRow={selectReport}
                shouldSingleExecuteRowSelect
                showLoadingPlaceholder={!areOptionsInitialized || !isScreenTransitionEnd}
                footerContent={!isDismissed && ChatFinderPageFooterInstance}
                isLoadingNewOptions={!!isSearchingForReports}
                shouldDelayFocus={false}
            />
        </ScreenWrapper>
    );
}

ChatFinderPage.displayName = 'ChatFinderPage';

export default withOnyx<ChatFinderPageProps, ChatFinderPageOnyxProps>({
    betas: {
        key: ONYXKEYS.BETAS,
    },
    isSearchingForReports: {
        key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
        initWithStoredValues: false,
    },
})(ChatFinderPage);
