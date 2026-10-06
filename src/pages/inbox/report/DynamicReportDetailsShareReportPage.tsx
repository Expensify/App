/**
 * Picks who to email an expense report to. Opens from Share report in the report's More menu.
 */
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SingleSelectWithAvatarListItem from '@components/SelectionList/ListItem/SingleSelectWithAvatarListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalDetailSearchSelector from '@hooks/usePersonalDetailSearchSelector';
import usePressLoading from '@hooks/usePressLoading';
import useThemeStyles from '@hooks/useThemeStyles';

import {searchUserInServer, shareReport} from '@libs/actions/Report';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import getPlatform from '@libs/getPlatform';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportDetailsNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessage} from '@libs/PersonalDetailOptionsListUtils';
import type {OptionData} from '@libs/PersonalDetailOptionsListUtils';
import {getReportName} from '@libs/ReportNameUtils';
import {canShareReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect, useState} from 'react';

import type {WithReportOrNotFoundProps} from './withReportOrNotFound';

import withReportOrNotFound from './withReportOrNotFound';

type DynamicReportDetailsShareReportPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportDetailsNavigatorParamList, typeof SCREENS.REPORT_DETAILS.DYNAMIC_SHARE_REPORT>;

function DynamicReportDetailsShareReportPage({report, policy}: DynamicReportDetailsShareReportPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_DETAILS_SHARE_REPORT.path);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [isSearchingForUsers] = useOnyx(ONYXKEYS.RAM_ONLY_IS_SEARCHING_FOR_USERS);

    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const {isLoading, startWithLoading} = usePressLoading();

    const {searchTerm, debouncedSearchTerm, setSearchTerm, selectedOptions, availableOptions, toggleSelection, areOptionsInitialized} = usePersonalDetailSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        includeUserToInvite: true,
        includeRecentReports: false,
        shouldUpdateSelectedOptionsOnSingleSelect: true,
        excludeLogins: CONST.EXPENSIFY_EMAILS_OBJECT,
        shouldInitialize: didScreenTransitionEnd,
    });

    useEffect(() => {
        searchUserInServer(debouncedSearchTerm);
    }, [debouncedSearchTerm]);

    const selectedLogin = selectedOptions.at(0)?.login;

    const shareWithSelectedUser = () => {
        if (!selectedLogin) {
            return;
        }
        startWithLoading(() => {
            shareReport(report.reportID, selectedLogin);
            Navigation.goBack(backPath);
        });
    };

    const sections: Array<Section<OptionData>> = [];
    if (areOptionsInitialized) {
        if (availableOptions.selectedOptions.length > 0) {
            sections.push({
                title: undefined,
                data: availableOptions.selectedOptions,
                sectionIndex: 0,
            });
        }

        if (availableOptions.personalDetails.length > 0) {
            sections.push({
                title: translate('common.contacts'),
                data: availableOptions.personalDetails,
                sectionIndex: 1,
            });
        }

        if (availableOptions.userToInvite) {
            sections.push({
                title: undefined,
                data: [availableOptions.userToInvite],
                sectionIndex: 2,
            });
        }
    }

    const textInputOptions = {
        label: translate('selectionList.nameEmailOrPhoneNumber'),
        value: searchTerm,
        onChangeText: setSearchTerm,
        headerMessage: sections.length > 0 ? '' : getHeaderMessage(translate, debouncedSearchTerm.trim().toLowerCase(), countryCode),
    };

    const footerContent = (
        <FormAlertWithSubmitButton
            isDisabled={!selectedLogin}
            isAlertVisible={false}
            buttonText={translate('common.shareReport')}
            shouldShowLoadingImmediatelyOnPress={false}
            isLoading={isLoading}
            onSubmit={shareWithSelectedUser}
            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
            enabledWhenOffline
        />
    );

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            shouldUseCachedViewportHeight
            testID="DynamicReportDetailsShareReportPage"
            enableEdgeToEdgeBottomSafeAreaPadding
            onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
        >
            <FullPageNotFoundView shouldShow={!canShareReport(report, policy, currentUserAccountID)}>
                <HeaderWithBackButton
                    title={translate('common.shareReport')}
                    subtitle={getReportName(report)}
                    onBackButtonPress={() => Navigation.goBack(backPath)}
                />
                <SelectionListWithSections
                    sections={sections}
                    ListItem={SingleSelectWithAvatarListItem}
                    shouldSingleExecuteRowSelect
                    onSelectRow={toggleSelection}
                    textInputOptions={textInputOptions}
                    confirmButtonOptions={{
                        onConfirm: shareWithSelectedUser,
                        isFooterConfirmEnabled: !!selectedLogin,
                        isFooterConfirmEnterKeyEnabled: getPlatform() !== CONST.PLATFORM.ANDROID,
                    }}
                    shouldShowLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd}
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    footerContent={footerContent}
                    isLoadingNewOptions={!!isSearchingForUsers}
                    addBottomSafeAreaPadding
                    shouldShowTextInput
                    disableMaintainingScrollPosition
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicReportDetailsShareReportPage);
