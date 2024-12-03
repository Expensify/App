import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import CopyTextToClipboard from '@components/CopyTextToClipboard';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import * as BankAccounts from '@userActions/BankAccounts';
import * as Link from '@userActions/Link';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Unit} from '@src/types/onyx/Policy';
import WorkspaceReimburseSection from './WorkspaceReimburseSection';

type WorkspaceReimburseViewOnyxProps = {
    /** Bank account attached to free plan */
    reimbursementAccount: OnyxEntry<OnyxTypes.ReimbursementAccount>;
};

type WorkspaceReimburseViewProps = WorkspaceReimburseViewOnyxProps & {
    /** Policy values needed in the component */
    policy: OnyxEntry<OnyxTypes.Policy>;
};

function WorkspaceReimburseView({policy, reimbursementAccount}: WorkspaceReimburseViewProps) {
    const styles = useThemeStyles();
    const [currentRatePerUnit, setCurrentRatePerUnit] = useState<string>('');
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const viewAllReceiptsUrl = `expenses?policyIDList=${policy?.id ?? '-1'}&billableReimbursable=reimbursable&submitterEmail=%2B%2B`;
    const distanceCustomUnit = PolicyUtils.getCustomUnit(policy);
    const distanceCustomRate = Object.values(distanceCustomUnit?.rates ?? {}).find((rate) => rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
    const {translate, toLocaleDigit} = useLocalize();
    const {isOffline} = useNetwork();

    const getUnitLabel = useCallback((value: Unit): string => translate(`common.${value}`), [translate]);

    const getCurrentRatePerUnitLabel = useCallback(() => {
        const customUnitRate = Object.values(distanceCustomUnit?.rates ?? {}).find((rate) => rate && rate.name === CONST.CUSTOM_UNITS.DEFAULT_RATE);
        const currentUnit = getUnitLabel(distanceCustomUnit?.attributes.unit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES);
        const currentRate = PolicyUtils.getUnitRateValue(toLocaleDigit, customUnitRate);
        const perWord = translate('common.per');

        return `${currentRate} ${perWord} ${currentUnit}`;
    }, [translate, distanceCustomUnit, toLocaleDigit, getUnitLabel]);

    const fetchData = useCallback(() => {
        // Instead of setting the reimbursement account loading within the optimistic data of the API command, use a separate action so that the Onyx value is updated right away.
        // openWorkspaceReimburseView uses API.read which will not make the request until all WRITE requests in the sequential queue have finished responding, so there would be a delay in
        // updating Onyx with the optimistic data.
        BankAccounts.setReimbursementAccountLoading(true);
        Policy.openWorkspaceReimburseView(policy?.id ?? '-1');
    }, [policy?.id]);

    useEffect(() => {
        if (isOffline) {
            return;
        }
        fetchData();
    }, [isOffline, fetchData]);

    useEffect(() => {
        setCurrentRatePerUnit(getCurrentRatePerUnitLabel());
    }, [policy?.customUnits, getCurrentRatePerUnitLabel]);

    return (
        <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
            <Section
                title={translate('workspace.reimburse.captureReceipts')}
                icon={Illustrations.MoneyReceipts}
                isCentralPane
                menuItems={[
                    {
                        title: translate('workspace.reimburse.viewAllReceipts'),
                        onPress: () => Link.openOldDotLink(viewAllReceiptsUrl),
                        icon: Expensicons.Receipt,
                        shouldShowRightIcon: true,
                        iconRight: Expensicons.NewWindow,
                        wrapperStyle: styles.cardMenuItem,
                        link: () => Link.buildOldDotURL(viewAllReceiptsUrl),
                    },
                ]}
            >
                <View style={[styles.mv3, styles.flexRow, styles.flexWrap]}>
                    <Text>
                        {translate('workspace.reimburse.captureNoVBACopyBeforeEmail')}
                        <CopyTextToClipboard
                            text={CONST.EMAIL.RECEIPTS}
                            textStyles={styles.textBlue}
                        />
                        <Text>{translate('workspace.reimburse.captureNoVBACopyAfterEmail')}</Text>
                    </Text>
                </View>
            </Section>

            <Section
                title={translate('workspace.reimburse.trackDistance')}
                icon={Illustrations.TrackShoe}
                isCentralPane
            >
                <View style={[styles.mv3, styles.flexRow, styles.flexWrap]}>
                    <Text>{translate('workspace.reimburse.trackDistanceCopy')}</Text>
                    <OfflineWithFeedback
                        pendingAction={distanceCustomUnit?.pendingAction ?? distanceCustomRate?.pendingAction}
                        shouldShowErrorMessages={false}
                        style={styles.w100}
                    >
                        <MenuItemWithTopDescription
                            title={currentRatePerUnit}
                            description={translate('workspace.reimburse.trackDistanceRate')}
                            shouldShowRightIcon
                            onPress={() => {
                                Policy.setPolicyIDForReimburseView(policy?.id ?? '-1');
                                Navigation.navigate(ROUTES.WORKSPACE_RATE_AND_UNIT.getRoute(policy?.id ?? '-1'));
                            }}
                            wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3]}
                            brickRoadIndicator={(distanceCustomUnit?.errors ?? distanceCustomRate?.errors) && CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR}
                        />
                    </OfflineWithFeedback>
                </View>
            </Section>

            <WorkspaceReimburseSection
                policy={policy}
                reimbursementAccount={reimbursementAccount}
            />
        </View>
    );
}

WorkspaceReimburseView.displayName = 'WorkspaceReimburseView';

export default withOnyx<WorkspaceReimburseViewProps, WorkspaceReimburseViewOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(WorkspaceReimburseView);
