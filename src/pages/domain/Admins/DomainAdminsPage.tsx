import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import type {DomainAdminRowData} from '@components/Tables/DomainAdminsTable';
import DomainAdminsTable from '@components/Tables/DomainAdminsTable';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDomainDocumentTitle from '@hooks/useDomainDocumentTitle';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShouldDisplayButtonsInSeparateLine from '@hooks/useShouldDisplayButtonsInSeparateLine';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {hasDomainAdminsSettingsErrors} from '@libs/DomainUtils';
import {getLatestError} from '@libs/ErrorUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';

import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {DomainSplitNavigatorParamList} from '@navigation/types';

import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';

import {clearAdminError} from '@userActions/Domain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {adminAccountIDsSelector, adminPendingActionSelector, domainNameSelector, technicalContactSettingsSelector} from '@selectors/Domain';
import React from 'react';
import {View} from 'react-native';

type DomainAdminsPageProps = PlatformStackScreenProps<DomainSplitNavigatorParamList, typeof SCREENS.DOMAIN.ADMINS>;

function DomainAdminsPage({route}: DomainAdminsPageProps) {
    const {domainAccountID} = route.params;
    const [domainName] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {selector: domainNameSelector});
    useDomainDocumentTitle(domainName, 'domain.domainAdmins');
    const {translate, formatPhoneNumber} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const illustrations = useMemoizedLazyIllustrations(['UserShield']);
    const icons = useMemoizedLazyExpensifyIcons(['Gear', 'Plus', 'DotIndicator']);

    const [adminAccountIDs] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: adminAccountIDsSelector,
    });

    const [domainErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`);

    const [domainPendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {
        selector: adminPendingActionSelector,
    });

    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [technicalContactSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainAccountID}`, {
        selector: technicalContactSettingsSelector,
    });

    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();
    const isAdmin = adminAccountIDs?.includes(currentUserAccountID);

    const technicalContactEmail = technicalContactSettings?.technicalContactEmail;

    const admins: DomainAdminRowData[] = (adminAccountIDs ?? [])
        .filter((accountID) => {
            const details = personalDetails?.[accountID];
            if (!details?.login && !details?.displayName) {
                return false;
            }

            const pendingAction = domainPendingAction?.[accountID]?.pendingAction;
            const errors = domainErrors?.adminErrors?.[accountID]?.errors;
            const isPendingDelete = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            return isOffline || !isPendingDelete || !isEmptyObject(errors);
        })
        .map((accountID) => {
            const details = personalDetails?.[accountID];
            const login = details?.login ?? '';
            const errors = domainErrors?.adminErrors?.[accountID]?.errors;
            const pendingAction = domainPendingAction?.[accountID]?.pendingAction;
            const isPendingActionDelete = pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

            return {
                keyForList: String(accountID),
                accountID,
                name: formatPhoneNumber(getDisplayNameOrDefault(details)),
                email: formatPhoneNumber(login),
                isPrimaryContact: !!technicalContactEmail && !!login && technicalContactEmail === login,
                errors: getLatestError(errors),
                pendingAction,
                disabled: isPendingActionDelete || !!details?.isOptimisticPersonalDetail,
                action: () => Navigation.navigate(ROUTES.DOMAIN_ADMIN_DETAILS.getRoute(domainAccountID, accountID)),
                dismissError: () => clearAdminError(domainAccountID, accountID),
            };
        });

    const hasSettingsErrors = hasDomainAdminsSettingsErrors(domainErrors);
    const shouldDisplayButtonsInSeparateLine = useShouldDisplayButtonsInSeparateLine();

    const headerContent = isAdmin ? (
        <View style={[styles.flexRow, styles.gap2]}>
            <Button
                success
                onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADD_ADMIN.getRoute(domainAccountID))}
                text={translate('domain.admins.addAdmin')}
                icon={icons.Plus}
                innerStyles={[shouldDisplayButtonsInSeparateLine && styles.alignItemsCenter]}
                style={shouldDisplayButtonsInSeparateLine && [styles.flexGrow1, styles.mb3]}
            />
            <Button
                onPress={() => Navigation.navigate(ROUTES.DOMAIN_ADMINS_SETTINGS.getRoute(domainAccountID))}
                text={translate('domain.common.settings')}
                icon={hasSettingsErrors ? icons.DotIndicator : icons.Gear}
                iconFill={hasSettingsErrors ? theme.danger : undefined}
                iconHoverFill={hasSettingsErrors ? theme.dangerHover : undefined}
                innerStyles={[shouldDisplayButtonsInSeparateLine && styles.alignItemsCenter]}
                style={shouldDisplayButtonsInSeparateLine ? [styles.flexGrow0, styles.mb3] : undefined}
            />
        </View>
    ) : null;

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID="DomainAdminsPage"
            >
                <HeaderWithBackButton
                    title={translate('domain.admins.title')}
                    onBackButtonPress={Navigation.goBack}
                    icon={illustrations.UserShield}
                    shouldShowBackButton={shouldUseNarrowLayout}
                    shouldUseHeadlineHeader
                    shouldDisplayHelpButton
                >
                    {!shouldDisplayButtonsInSeparateLine && headerContent}
                </HeaderWithBackButton>
                {shouldDisplayButtonsInSeparateLine && !!headerContent && <View style={[styles.ph5, styles.flexRow, styles.gap2]}>{headerContent}</View>}
                <DomainAdminsTable admins={admins} />
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

DomainAdminsPage.displayName = 'DomainAdminsPage';

export default DomainAdminsPage;
