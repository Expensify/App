import type {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {ParticipantsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import withReportOrNotFound from './home/report/withReportOrNotFound';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';

type ReportParticipantDetailsRoleSelectionPageProps = WithReportOrNotFoundProps & StackScreenProps<ParticipantsNavigatorParamList, typeof SCREENS.REPORT_PARTICIPANTS.ROLE>;

type ListItemType = {
    value: typeof CONST.REPORT.ROLE.ADMIN | typeof CONST.REPORT.ROLE.MEMBER;
    text: string;
    isSelected: boolean;
    keyForList: typeof CONST.REPORT.ROLE.ADMIN | typeof CONST.REPORT.ROLE.MEMBER;
};

function ReportParticipantDetailsRoleSelectionPage({report, route}: ReportParticipantDetailsRoleSelectionPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const accountID = Number(route.params.accountID) ?? 0;
    // const reportID = route.params.reportID;
    const backTo = route.params.backTo ?? ('' as Route);
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
        // add API call
        Navigation.goBack(backTo);
    };

    return (
        <ScreenWrapper testID={ReportParticipantDetailsRoleSelectionPage.displayName}>
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

ReportParticipantDetailsRoleSelectionPage.displayName = 'ReportParticipantDetailsRoleSelectionPage';

export default withReportOrNotFound()(ReportParticipantDetailsRoleSelectionPage);
