import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@libs/actions/Report';
import Navigation from '@navigation/Navigation';
import type {ParticipantsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';

type ReportParticipantRoleSelectionPageProps = WithReportOrNotFoundProps & StackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.ROLE>;

type ListItemType = {
    value: typeof CONST.REPORT.ROLE.ADMIN | typeof CONST.REPORT.ROLE.MEMBER;
    text: string;
    isSelected: boolean;
    keyForList: typeof CONST.REPORT.ROLE.ADMIN | typeof CONST.REPORT.ROLE.MEMBER;
};

function ReportParticipantRoleSelectionPage({report, route}: ReportParticipantRoleSelectionPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const accountID = Number(route.params.accountID) ?? 0;
    const backTo = ROUTES.REPORT_PARTICIPANTS_DETAILS.getRoute(report?.reportID ?? '', accountID);
    const member = report.participants?.[accountID];

    const items: ListItemType[] = [
        {
            value: CONST.REPORT.ROLE.ADMIN,
            text: translate('common.admin'),
            isSelected: member?.role === CONST.REPORT.ROLE.ADMIN,
            keyForList: CONST.REPORT.ROLE.ADMIN,
        },
        {
            value: CONST.REPORT.ROLE.MEMBER,
            text: translate('common.member'),
            isSelected: member?.role === CONST.REPORT.ROLE.MEMBER,
            keyForList: CONST.REPORT.ROLE.MEMBER,
        },
    ];

    const changeRole = ({value}: ListItemType) => {
        if (!member) {
            return;
        }

        Report.updateGroupChatMemberRoles(report.reportID, [accountID], value);
        Navigation.goBack(backTo);
    };

    return (
        <ScreenWrapper testID={ReportParticipantRoleSelectionPage.displayName}>
            <HeaderWithBackButton
                title={translate('common.role')}
                onBackButtonPress={() => Navigation.goBack(backTo)}
            />
            <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                <SelectionList
                    sections={[{data: items}]}
                    ListItem={RadioListItem}
                    onSelectRow={changeRole}
                    initiallyFocusedOptionKey={items.find((item) => item.isSelected)?.keyForList}
                />
            </View>
        </ScreenWrapper>
    );
}

ReportParticipantRoleSelectionPage.displayName = 'ReportParticipantRoleSelectionPage';

export default withReportOrNotFound()(ReportParticipantRoleSelectionPage);
