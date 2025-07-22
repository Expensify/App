import React, {useCallback, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {changeReportApprover} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportChangeApproverParamList} from '@libs/Navigation/types';
import {getManagerAccountEmail, isPolicyAdmin, isUserPolicyAdmin} from '@libs/PolicyUtils';
import {isMoneyRequestReport, isMoneyRequestReportPendingDeletion} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import NotFoundPage from './ErrorPage/NotFoundPage';
import type {WithReportOrNotFoundProps} from './home/report/withReportOrNotFound';
import withReportOrNotFound from './home/report/withReportOrNotFound';

type ReportChangeApproverPageProps = WithReportOrNotFoundProps & PlatformStackScreenProps<ReportChangeApproverParamList, typeof SCREENS.REPORT_CHANGE_APPROVER.ROOT>;

function ReportChangeApproverPage({report, policy, isLoadingReportData}: ReportChangeApproverPageProps) {
    const reportID = report?.reportID;
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [selectedApproverType, setSelectedApproverType] = useState<string>();

    const changeApprover = useCallback(() => {
        if (!selectedApproverType) {
            return;
        }

        if (!isPolicyAdmin(policy) || !policy || !session?.accountID) {
            return;
        }
        changeReportApprover(reportID, policy.id, session.accountID);
        Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    }, [selectedApproverType, policy, reportID, session?.accountID]);

    const sections = useMemo(() => {
        const data = [];

        if (!isUserPolicyAdmin(policy, getManagerAccountEmail(policy, report))) {
            data.push({
                text: translate('iou.changeApprover.actions.bypassApprovers'),
                keyForList: 'bypassApprover',
                value: 'bypassApprover',
                alternateText: translate('iou.changeApprover.actions.bypassApproversSubtitle'),
                isSelected: selectedApproverType === 'bypassApprover',
            });
        }

        return [{data}];
    }, [report, policy, selectedApproverType, translate]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !isPolicyAdmin(policy) || !isMoneyRequestReport(report) || isMoneyRequestReportPendingDeletion(report);

    if (shouldShowNotFoundView) {
        return <NotFoundPage />;
    }

    return (
        <ScreenWrapper
            testID={ReportChangeApproverPage.displayName}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('iou.changeApprover.title')}
                onBackButtonPress={Navigation.goBack}
            />
            <SelectionList
                ListItem={RadioListItem}
                sections={sections}
                isAlternateTextMultilineSupported
                onSelectRow={(option) => setSelectedApproverType(option.keyForList)}
                showConfirmButton
                confirmButtonText={translate('iou.changeApprover.title')}
                onConfirm={changeApprover}
                customListHeader={
                    <>
                        <Text style={[styles.ph5, styles.mb5]}>{translate('iou.changeApprover.subtitle')}</Text>
                        <Text style={[styles.ph5, styles.mb5]}>
                            {translate('iou.changeApprover.description')}
                            <TextLink onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS.getRoute(policy?.id))}>{translate('iou.changeApprover.workflowSettings')}</TextLink>.
                        </Text>
                    </>
                }
            />
        </ScreenWrapper>
    );
}

ReportChangeApproverPage.displayName = 'ReportChangeApproverPage';

export default withReportOrNotFound()(ReportChangeApproverPage);
