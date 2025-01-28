import React from 'react';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as Localize from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type AutoReportingFrequencyKey = Exclude<ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>, 'instant'>;
type Locale = ValueOf<typeof CONST.LOCALES>;

type WorkspaceAutoReportingFrequencyPageProps = WithPolicyOnyxProps & PlatformStackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY>;

type WorkspaceAutoReportingFrequencyPageItem = {
    text: string;
    keyForList: string;
    isSelected: boolean;
    footerComponent?: React.ReactNode | null;
};

type AutoReportingFrequencyDisplayNames = Record<AutoReportingFrequencyKey, string>;

const getAutoReportingFrequencyDisplayNames = (locale: Locale): AutoReportingFrequencyDisplayNames => ({
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY]: Localize.translate(locale, 'workflowsPage.frequencies.monthly'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE]: Localize.translate(locale, 'workflowsPage.frequencies.daily'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]: Localize.translate(locale, 'workflowsPage.frequencies.weekly'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY]: Localize.translate(locale, 'workflowsPage.frequencies.twiceAMonth'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP]: Localize.translate(locale, 'workflowsPage.frequencies.byTrip'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL]: Localize.translate(locale, 'workflowsPage.frequencies.manually'),
});

function WorkspaceAutoReportingFrequencyPage({policy, route}: WorkspaceAutoReportingFrequencyPageProps) {
    const autoReportingFrequency = PolicyUtils.getCorrectedAutoReportingFrequency(policy);

    const {translate, preferredLocale, toLocaleOrdinal} = useLocalize();
    const styles = useThemeStyles();

    const onSelectAutoReportingFrequency = (item: WorkspaceAutoReportingFrequencyPageItem) => {
        Policy.setWorkspaceAutoReportingFrequency(policy?.id ?? '-1', item.keyForList as AutoReportingFrequencyKey);

        if (item.keyForList === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY) {
            return;
        }

        Navigation.goBack();
    };

    const getDescriptionText = () => {
        if (policy?.autoReportingOffset === undefined) {
            return toLocaleOrdinal(1);
        }
        if (typeof policy?.autoReportingOffset === 'number') {
            return toLocaleOrdinal(policy.autoReportingOffset);
        }
        if (typeof policy?.autoReportingOffset === 'string' && parseInt(policy?.autoReportingOffset, 10)) {
            return toLocaleOrdinal(parseInt(policy.autoReportingOffset, 10));
        }

        return translate(`workflowsPage.frequencies.${policy?.autoReportingOffset}`);
    };

    const monthlyFrequencyDetails = () => (
        <OfflineWithFeedback
            pendingAction={policy?.pendingFields?.autoReportingOffset}
            errors={ErrorUtils.getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET)}
            onClose={() => Policy.clearPolicyErrorField(policy?.id ?? '-1', CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET)}
            errorRowStyles={[styles.ml7]}
        >
            <MenuItem
                title={translate('workflowsPage.submissionFrequencyDateOfMonth')}
                titleStyle={styles.textLabelSupportingNormal}
                description={getDescriptionText()}
                descriptionTextStyle={styles.textNormalThemeText}
                wrapperStyle={styles.pr3}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET.getRoute(policy?.id ?? ''))}
                shouldShowRightIcon
            />
        </OfflineWithFeedback>
    );

    const autoReportingFrequencyItems: WorkspaceAutoReportingFrequencyPageItem[] = Object.keys(getAutoReportingFrequencyDisplayNames(preferredLocale)).map((frequencyKey) => ({
        text: getAutoReportingFrequencyDisplayNames(preferredLocale)[frequencyKey as AutoReportingFrequencyKey] || '',
        keyForList: frequencyKey,
        isSelected: frequencyKey === autoReportingFrequency,
        footerContent: frequencyKey === autoReportingFrequency && frequencyKey === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY ? monthlyFrequencyDetails() : null,
    }));

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceAutoReportingFrequencyPage.displayName}
            >
                <FullPageNotFoundView
                    onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                    onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                    shouldShow={isEmptyObject(policy) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy) || !PolicyUtils.isPaidGroupPolicy(policy)}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                >
                    <HeaderWithBackButton
                        title={translate('workflowsPage.submissionFrequency')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <OfflineWithFeedback
                        pendingAction={policy?.pendingFields?.autoReportingFrequency}
                        errors={ErrorUtils.getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_FREQUENCY)}
                        onClose={() => Policy.clearPolicyErrorField(policy?.id ?? '-1', CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_FREQUENCY)}
                        style={styles.flex1}
                        contentContainerStyle={styles.flex1}
                    >
                        <SelectionList
                            ListItem={RadioListItem}
                            sections={[{data: autoReportingFrequencyItems}]}
                            onSelectRow={onSelectAutoReportingFrequency}
                            initiallyFocusedOptionKey={autoReportingFrequency}
                            shouldUpdateFocusedIndex
                        />
                    </OfflineWithFeedback>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceAutoReportingFrequencyPage.displayName = 'WorkspaceAutoReportingFrequencyPage';
export type {AutoReportingFrequencyDisplayNames, AutoReportingFrequencyKey};
export {getAutoReportingFrequencyDisplayNames};
export default withPolicy(WorkspaceAutoReportingFrequencyPage);
