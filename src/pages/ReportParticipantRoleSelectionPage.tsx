import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Report from '@libs/actions/Report';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {ParticipantsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import NotFoundPage from './ErrorPage/NotFoundPage';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';

type ReportParticipantRoleSelectionPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.ROLE>;

type ListItemType = ListItem & {
    value: ValueOf<typeof CONST.REPORT.ROLE>;
};

function ReportParticipantRoleSelectionPage({report, route}: ReportParticipantRoleSelectionPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const accountID = Number(route?.params?.accountID) ?? -1;
    const backTo = ROUTES.REPORT_PARTICIPANTS_DETAILS.getRoute(report?.reportID ?? '-1', accountID, route.params.backTo);
    const member = report.participants?.[accountID];

    if (!member) {
        return <NotFoundPage />;
    }

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
                    shouldSingleExecuteRowSelect
                    initiallyFocusedOptionKey={items.find((item) => item.isSelected)?.keyForList}
                />
            </View>
        </ScreenWrapper>
    );
}

ReportParticipantRoleSelectionPage.displayName = 'ReportParticipantRoleSelectionPage';

export default withReportOrNotFound()(ReportParticipantRoleSelectionPage);
