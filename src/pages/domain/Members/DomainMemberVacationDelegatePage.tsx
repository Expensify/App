import React, { useMemo } from 'react';
import { View } from 'react-native';
import type { OnyxEntry } from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionListWithSections';
import UserListItem from '@components/SelectionListWithSections/UserListItem';
import Text from '@components/Text';
import { useMemoizedLazyExpensifyIcons } from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useSearchSelector from '@hooks/useSearchSelector';
import useThemeStyles from '@hooks/useThemeStyles';
import { formatPhoneNumber } from '@libs/LocalePhoneNumber';
import { getHeaderMessage } from '@libs/OptionsListUtils';
import { getPersonalDetailByEmail } from '@libs/PersonalDetailsUtils';
import type { PlatformStackScreenProps } from '@navigation/PlatformStackNavigation/types';
import type { SettingsNavigatorParamList } from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type { Domain } from '@src/types/onyx';


type DomainMemberVacationDelegatePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.VACATION_DELEGATE>;

function DomainMemberVacationDelegatePage({route}: DomainMemberVacationDelegatePageProps) {
    const {domainAccountID, accountID} = route.params;

    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const [isSearchingForReports] = useOnyx(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, {initWithStoredValues: false, canBeMissing: false});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    // eslint-disable-next-line rulesdir/no-inline-useOnyx-selector
    const [vacationDelegate] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        canBeMissing: true,
        selector: (domain: OnyxEntry<Domain>) => domain?.[`${CONST.DOMAIN.PRIVATE_VACATION_DELEGATE_PREFIX}${String(accountID)}` as const].delegate,
    });
    const delegatePersonalDetails = getPersonalDetailByEmail(vacationDelegate ?? '');

    const excludeLogins = {
        ...CONST.EXPENSIFY_EMAILS_OBJECT,
        ...(vacationDelegate && {[vacationDelegate]: true}),
    };

    const {searchTerm, debouncedSearchTerm, setSearchTerm, availableOptions, areOptionsInitialized, onListEndReached} = useSearchSelector({
        selectionMode: CONST.SEARCH_SELECTOR.SELECTION_MODE_SINGLE,
        maxRecentReportsToShow: CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        searchContext: CONST.SEARCH_SELECTOR.SEARCH_CONTEXT_GENERAL,
        excludeLogins,
        includeRecentReports: true,
        getValidOptionsConfig: {
            excludeLogins,
        },
    });

    const sectionsList = [];
    if (vacationDelegate && delegatePersonalDetails) {
        sectionsList.push({
            title: undefined,
            data: [
                {
                    ...delegatePersonalDetails,
                    text: delegatePersonalDetails?.displayName ?? vacationDelegate,
                    alternateText: delegatePersonalDetails?.login ?? vacationDelegate,
                    login: delegatePersonalDetails.login ?? vacationDelegate,
                    keyForList: `vacationDelegate-${delegatePersonalDetails.login}`,
                    isDisabled: false,
                    isSelected: true,
                    shouldShowSubscript: undefined,
                    icons: [
                        {
                            source: delegatePersonalDetails?.avatar ?? icons.FallbackAvatar,
                            name: formatPhoneNumber(delegatePersonalDetails?.login ?? ''),
                            type: CONST.ICON_TYPE_AVATAR,
                            id: delegatePersonalDetails?.accountID,
                        },
                    ],
                },
            ],
            shouldShow: true,
        });
    }

    sectionsList.push({
        title: translate('common.recents'),
        data: availableOptions.recentReports,
        shouldShow: availableOptions.recentReports?.length > 0,
    });

    sectionsList.push({
        title: translate('common.contacts'),
        data: availableOptions.personalDetails,
        shouldShow: availableOptions.personalDetails?.length > 0,
    });

    if (availableOptions.userToInvite) {
        sectionsList.push({
            title: undefined,
            data: [availableOptions.userToInvite],
            shouldShow: true,
        });
    }

    const sections = sectionsList.map((section) => ({
        ...section,
        data: section.data.map((option) => ({
            ...option,
            text: option.text ?? option.displayName ?? '',
            alternateText: option.alternateText ?? option.login ?? undefined,
            keyForList: option.keyForList ?? '',
            isDisabled: option.isDisabled ?? undefined,
            isSelected: option.isSelected ?? undefined,
            login: option.login ?? undefined,
            shouldShowSubscript: option.shouldShowSubscript ?? undefined,
        })),
    }));

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID={DomainMemberVacationDelegatePage.displayName}
            >
                <HeaderWithBackButton title={translate('domain.common.vacationDelegate')} />

                <View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionList
                        sections={areOptionsInitialized ? sections : []}
                        ListItem={UserListItem}
                        onSelectRow={()=>{}}
                        shouldSingleExecuteRowSelect
                        onChangeText={setSearchTerm}
                        textInputValue={searchTerm}
                        headerMessage={getHeaderMessage(
                            (availableOptions.recentReports?.length || 0) + (availableOptions.personalDetails?.length || 0) !== 0,
                            !!availableOptions.userToInvite,
                            debouncedSearchTerm.trim(),
                            countryCode,
                            false,
                        )}
                        textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')}
                        showLoadingPlaceholder={!areOptionsInitialized}
                        isLoadingNewOptions={!!isSearchingForReports}
                        onEndReached={onListEndReached}
                    />
                </View>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainMemberVacationDelegatePage.displayName = 'DomainMemberVacationDelegate';

export default DomainMemberVacationDelegatePage;
