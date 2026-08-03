import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateGroupChatMemberRoles} from '@libs/actions/Report';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {ParticipantsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {WithReportOrNotFoundProps} from './inbox/report/withReportOrNotFound';

import NotFoundPage from './ErrorPage/NotFoundPage';
import withReportOrNotFound from './inbox/report/withReportOrNotFound';

type DynamicReportParticipantRoleSelectionPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.DYNAMIC_ROLE>;

type ListItemType = ListItem & {
    value: ValueOf<typeof CONST.REPORT.ROLE>;
};

function DynamicReportParticipantRoleSelectionPage({report, route}: DynamicReportParticipantRoleSelectionPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const accountID = Number(route?.params?.accountID) ?? -1;
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.REPORT_PARTICIPANTS_ROLE.path);
    const member = report.participants?.[accountID];

    const [draftRole, setDraftRole] = useState<ValueOf<typeof CONST.REPORT.ROLE>>();
    const selectedRole = draftRole ?? member?.role;

    const saveAndGoBack = () => {
        if (selectedRole) {
            updateGroupChatMemberRoles(report.reportID, [accountID], selectedRole);
        }
        Navigation.goBack(backPath);
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveAndGoBack,
        isDisabled: selectedRole === member?.role,
    };

    if (!member) {
        return <NotFoundPage />;
    }

    const items: ListItemType[] = [
        {
            value: CONST.REPORT.ROLE.ADMIN,
            text: translate('common.admin'),
            isSelected: selectedRole === CONST.REPORT.ROLE.ADMIN,
            keyForList: CONST.REPORT.ROLE.ADMIN,
        },
        {
            value: CONST.REPORT.ROLE.MEMBER,
            text: translate('common.member'),
            isSelected: selectedRole === CONST.REPORT.ROLE.MEMBER,
            keyForList: CONST.REPORT.ROLE.MEMBER,
        },
    ];

    return (
        <ScreenWrapper testID="DynamicReportParticipantRoleSelectionPage">
            <HeaderWithBackButton
                title={translate('common.role')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                <SelectionList
                    data={items}
                    ListItem={SingleSelectListItem}
                    onSelectRow={({value}: ListItemType) => setDraftRole(value)}
                    confirmButtonOptions={confirmButtonOptions}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={member.role}
                />
            </View>
        </ScreenWrapper>
    );
}

export default withReportOrNotFound()(DynamicReportParticipantRoleSelectionPage);
