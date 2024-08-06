import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxProvider';
import {useOptionsList} from '@components/OptionListContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import type {OptionData} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import * as SearchActions from '@userActions/Search';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const defaultListOptions = {
    userToInvite: null,
    recentReports: [],
    personalDetails: [],
    currentUserOption: null,
    headerMessage: '',
    categoryOptions: [],
    tagOptions: [],
    taxRatesOptions: [],
};

function SearchFiltersStatusPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const personalDetails = usePersonalDetails();
    const {options, areOptionsInitialized} = useOptionsList();

    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [selectedOptions, setSelectedOptions] = useState<OptionData[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const cleanSearchTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);

    const defaultOptions = useMemo(() => {
        if (!areOptionsInitialized) {
            return defaultListOptions;
        }

        return OptionsListUtils.getFilteredOptions(options.reports, options.personalDetails, betas, '', selectedOptions);
    }, [areOptionsInitialized, betas, options.personalDetails, options.reports, selectedOptions]);

    const chatOptions = useMemo(() => {
        return OptionsListUtils.filterOptions(defaultOptions, cleanSearchTerm, {
            betas,
            selectedOptions,
            excludeLogins: CONST.EXPENSIFY_EMAILS,
            maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
    }, [defaultOptions, cleanSearchTerm, betas, selectedOptions]);

    const sections = useMemo(() => {
        const newSections: OptionsListUtils.CategorySection[] = [];
        if (!areOptionsInitialized) {
            return newSections;
        }

        const formatResults = OptionsListUtils.formatSectionsFromSearchTerm(cleanSearchTerm, selectedOptions, chatOptions.recentReports, chatOptions.personalDetails, personalDetails, true);

        newSections.push(formatResults.section);

        newSections.push({
            title: translate('common.recents'),
            data: chatOptions.recentReports,
            shouldShow: chatOptions.recentReports.length > 0,
        });

        newSections.push({
            title: translate('common.contacts'),
            data: chatOptions.personalDetails,
            shouldShow: chatOptions.personalDetails.length > 0,
        });

        return newSections;
    }, [areOptionsInitialized, cleanSearchTerm, selectedOptions, chatOptions.recentReports, chatOptions.personalDetails, personalDetails, translate]);

    // This effect handles setting initial selectedOptions based on accountIDs saved in onyx form
    useEffect(() => {
        const accountIDs = searchAdvancedFiltersForm?.from;
        if (accountIDs) {
            const [, recents, contacts] = sections;
            const selectedRecents = recents ? recents.data.filter((option) => accountIDs.includes(option.accountID.toString())) : [];
            const selectedContacts = contacts ? contacts.data.filter((option) => accountIDs.includes(option.accountID.toString())) : [];

            const preSelectedOptions: OptionData[] = [...selectedRecents, ...selectedContacts].map((option) => ({...option, selected: true}));

            setSelectedOptions(preSelectedOptions);
        }
    }, [searchAdvancedFiltersForm]);

    const handleParticipantSelection = useCallback(
        (option: OptionData) => {
            const foundOptionIndex = selectedOptions.findIndex((selectedOption: OptionData) => {
                if (selectedOption.accountID && selectedOption.accountID === option?.accountID) {
                    return true;
                }

                if (selectedOption.reportID && selectedOption.reportID === option?.reportID) {
                    return true;
                }

                return false;
            });

            if (foundOptionIndex < 0) {
                setSelectedOptions([...selectedOptions, {...option, selected: true}]);
            } else {
                const newSelectedOptions = [...selectedOptions.slice(0, foundOptionIndex), ...selectedOptions.slice(foundOptionIndex + 1)];
                setSelectedOptions(newSelectedOptions);
            }
        },
        [selectedOptions],
    );

    const footerContent = (
        <Button
            success
            text={translate('common.save')}
            pressOnEnter
            onPress={() => {
                const selectedAccountIDs = selectedOptions.map((option) => (option.accountID ? option.accountID.toString() : undefined)).filter(Boolean) as string[];
                SearchActions.updateAdvancedFilters({
                    from: selectedAccountIDs,
                });
                Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
            }}
            large
        />
    );

    return (
        <ScreenWrapper
            testID={SearchFiltersStatusPage.displayName}
            includeSafeAreaPaddingBottom={false}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
        >
            <FullPageNotFoundView shouldShow={false}>
                <HeaderWithBackButton title={translate('common.from')} />
                <View style={[styles.flex1]}>
                    <SelectionList
                        canSelectMultiple
                        sections={sections}
                        ListItem={InviteMemberListItem}
                        textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                        textInputValue={searchTerm}
                        footerContent={footerContent}
                        showScrollIndicator
                        showLoadingPlaceholder={false}
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        onChangeText={(value) => {
                            setSearchTerm(value);
                        }}
                        onSelectRow={handleParticipantSelection}
                        // onConfirm={updateForm}
                        // isLoadingNewOptions={!!isSearchingForReports}
                    />
                </View>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

SearchFiltersStatusPage.displayName = 'SearchFiltersStatusPage';

export default SearchFiltersStatusPage;
