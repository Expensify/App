import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as IOU from '@userActions/IOU';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Policy} from '@src/types/onyx';
import StepScreenWrapper from './StepScreenWrapper';
import withFullTransactionOrNotFound from './withFullTransactionOrNotFound';
import type {WithFullTransactionOrNotFoundProps} from './withFullTransactionOrNotFound';
import withWritableReportOrNotFound from './withWritableReportOrNotFound';
import type {WithWritableReportOrNotFoundProps} from './withWritableReportOrNotFound';

type WorkspaceListItem = ListItem & {
    value: string;
};

type IOURequestStepSendFromOnyxProps = {
    /** The list of all policies */
    allPolicies: OnyxCollection<Policy>;
};

type IOURequestStepSendFromProps = IOURequestStepSendFromOnyxProps &
    WithWritableReportOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM> &
    WithFullTransactionOrNotFoundProps<typeof SCREENS.MONEY_REQUEST.STEP_SEND_FROM>;

function IOURequestStepSendFrom({route, transaction, allPolicies}: IOURequestStepSendFromProps) {
    const {translate} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();
    const {transactionID, backTo} = route.params;

    const workspaceOptions: WorkspaceListItem[] = useMemo(() => {
        const activeAdminWorkspaces = PolicyUtils.getActiveAdminWorkspaces(allPolicies);
        return activeAdminWorkspaces.map((policy) => ({
            text: policy.name,
            value: policy.id,
            keyForList: policy.id,
            icons: [
                {
                    source: policy?.avatar ? policy.avatar : ReportUtils.getDefaultWorkspaceAvatar(policy.name),
                    fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                    name: policy.name,
                    type: CONST.ICON_TYPE_WORKSPACE,
                },
            ],
            isSelected: !!transaction?.participants?.find((participant) => participant.policyID === policy.id),
        }));
    }, [allPolicies, transaction]);

    const navigateBack = () => {
        Navigation.goBack(backTo);
    };

    const selectWorkspace = (item: WorkspaceListItem) => {
        const newParticipants = (transaction?.participants ?? []).filter((participant) => participant.accountID);

        newParticipants.push({
            policyID: item.value,
            isSender: true,
            selected: false,
        });

        IOU.setMoneyRequestParticipants_temporaryForRefactor(transactionID, newParticipants);
        navigateBack();
    };

    const renderCheckbox = useCallback(
        (item: ListItem) => (
            <View style={[styles.roundCheckmarkWrapper, styles.mh2]}>
                {item.isSelected && (
                    <Icon
                        src={Expensicons.Checkmark}
                        fill={theme.success}
                    />
                )}
            </View>
        ),
        [styles.roundCheckmarkWrapper, styles.mh2, theme.success],
    );

    return (
        <StepScreenWrapper
            headerTitle={translate('workspace.invoices.sendFrom')}
            onBackButtonPress={navigateBack}
            shouldShowWrapper
            testID={IOURequestStepSendFrom.displayName}
            includeSafeAreaPaddingBottom
        >
            <SelectionList
                sections={[{data: workspaceOptions, title: translate('common.workspaces')}]}
                onSelectRow={selectWorkspace}
                ListItem={UserListItem}
                rightHandSideComponent={renderCheckbox}
            />
        </StepScreenWrapper>
    );
}

IOURequestStepSendFrom.displayName = 'IOURequestStepSendFrom';

export default withWritableReportOrNotFound(
    withFullTransactionOrNotFound(
        withOnyx<IOURequestStepSendFromProps, IOURequestStepSendFromOnyxProps>({
            allPolicies: {
                key: ONYXKEYS.COLLECTION.POLICY,
            },
        })(IOURequestStepSendFrom),
    ),
);
