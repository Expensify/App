import {domainSecurityGroupSettingErrorsSelector, domainSecurityGroupSettingPendingActionSelector, selectGroupByID} from '@selectors/Domain';
import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Navigation from '@navigation/Navigation';
import type {PlatformStackScreenProps} from '@navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import DomainNotFoundPageWrapper from '@pages/domain/DomainNotFoundPageWrapper';
import {clearDomainSecurityGroupSettingError} from '@userActions/Domain';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import DefaultGroupToggle from './DefaultGroupToggle';
import HTMLMessagesRow from './HTMLMessagesRow';

type DomainGroupDetailsPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.DOMAIN.GROUP_DETAILS>;

function DomainGroupDetailsPage({route}: DomainGroupDetailsPageProps) {
    const {domainAccountID, groupID} = route.params;

    const {translate} = useLocalize();

    const [group] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN}${domainAccountID}`, {
        selector: selectGroupByID(groupID),
    });

    const [namePendingAction] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_PENDING_ACTIONS}${domainAccountID}`, {selector: domainSecurityGroupSettingPendingActionSelector('name', groupID)});
    const [nameErrors] = useOnyx(`${ONYXKEYS.COLLECTION.DOMAIN_ERRORS}${domainAccountID}`, {selector: domainSecurityGroupSettingErrorsSelector('nameErrors', groupID)});

    return (
        <DomainNotFoundPageWrapper domainAccountID={domainAccountID}>
            <ScreenWrapper
                shouldEnableMaxHeight
                shouldShowOfflineIndicatorInWideScreen
                testID="DomainGroupDetailsPage"
            >
                <HeaderWithBackButton
                    title={group?.name ?? translate('domain.groups.title')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.DOMAIN_GROUPS.getRoute(domainAccountID))}
                />
                <ScrollView>
                    <OfflineWithFeedback pendingAction={namePendingAction}>
                        <MenuItemWithTopDescription
                            description={translate('common.name')}
                            title={group?.name ?? ''}
                            shouldShowRightIcon
                            onPress={() => Navigation.navigate(ROUTES.DOMAIN_GROUP_EDIT_NAME.getRoute(domainAccountID, groupID))}
                        />
                        <HTMLMessagesRow
                            errors={nameErrors}
                            onDismiss={() => clearDomainSecurityGroupSettingError(domainAccountID, groupID, 'nameErrors')}
                        />
                    </OfflineWithFeedback>
                    <DefaultGroupToggle
                        domainAccountID={domainAccountID}
                        groupID={groupID}
                        groupName={group?.name}
                    />
                </ScrollView>
            </ScreenWrapper>
        </DomainNotFoundPageWrapper>
    );
}

export default DomainGroupDetailsPage;
