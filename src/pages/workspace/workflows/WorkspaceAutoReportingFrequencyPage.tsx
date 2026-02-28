import React from 'react';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getCorrectedAutoReportingFrequency, goBackFromInvalidPolicy, isPaidGroupPolicy, isPendingDeletePolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import {clearPolicyErrorField, setWorkspaceAutoReportingFrequency} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type AutoReportingFrequencyKey = ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;

type WorkspaceAutoReportingFrequencyPageProps = WithPolicyOnyxProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY>;

type WorkspaceAutoReportingFrequencyPageItem = {
    text: string;
    keyForList: string;
    isSelected: boolean;
    footerComponent?: React.ReactNode | null;
};

type AutoReportingFrequencyDisplayNames = Record<AutoReportingFrequencyKey, string>;

const getAutoReportingFrequencyDisplayNames = (translate: LocaleContextProps['translate']): AutoReportingFrequencyDisplayNames => ({
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY]: translate('workflowsPage.frequencies.monthly'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE]: translate('workflowsPage.frequencies.daily'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]: translate('workflowsPage.frequencies.weekly'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY]: translate('workflowsPage.frequencies.twiceAMonth'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP]: translate('workflowsPage.frequencies.byTrip'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT]: translate('workflowsPage.frequencies.instant'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL]: translate('workflowsPage.frequencies.manually'),
});

function WorkspaceAutoReportingFrequencyPage({policy, route}: WorkspaceAutoReportingFrequencyPageProps) {
    const autoReportingFrequency = getCorrectedAutoReportingFrequency(policy);

    const {translate, toLocaleOrdinal} = useLocalize();
    const styles = useThemeStyles();

    const onSelectAutoReportingFrequency = (item: WorkspaceAutoReportingFrequencyPageItem) => {
        if (!policy?.id) {
            return;
        }
        setWorkspaceAutoReportingFrequency(policy.id, item.keyForList as AutoReportingFrequencyKey);

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
            errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET)}
            onClose={() => clearPolicyErrorField(policy?.id, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET)}
            errorRowStyles={[styles.ml7]}
        >
            <MenuItem
                title={translate('workflowsPage.submissionFrequencyDateOfMonth')}
                titleStyle={styles.textLabelSupportingNormal}
                description={getDescriptionText()}
                descriptionTextStyle={styles.textNormalThemeText}
                wrapperStyle={styles.pr3}
                onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET.getRoute(policy?.id))}
                shouldShowRightIcon
            />
        </OfflineWithFeedback>
    );

    const autoReportingFrequencyItems: WorkspaceAutoReportingFrequencyPageItem[] = Object.keys(getAutoReportingFrequencyDisplayNames(translate)).map((frequencyKey) => ({
        text: getAutoReportingFrequencyDisplayNames(translate)[frequencyKey as AutoReportingFrequencyKey] || '',
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
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="WorkspaceAutoReportingFrequencyPage"
            >
                <FullPageNotFoundView
                    onBackButtonPress={goBackFromInvalidPolicy}
                    onLinkPress={goBackFromInvalidPolicy}
                    shouldShow={isEmptyObject(policy) || !isPolicyAdmin(policy) || isPendingDeletePolicy(policy) || !isPaidGroupPolicy(policy)}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    addBottomSafeAreaPadding
                >
                    <HeaderWithBackButton
                        title={translate('common.frequency')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <OfflineWithFeedback
                        pendingAction={policy?.pendingFields?.autoReportingFrequency}
                        errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_FREQUENCY)}
                        onClose={() => clearPolicyErrorField(policy?.id, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_FREQUENCY)}
                        style={styles.flex1}
                        contentContainerStyle={styles.flex1}
                    >
                        <SelectionList
                            ListItem={RadioListItem}
                            data={autoReportingFrequencyItems}
                            onSelectRow={onSelectAutoReportingFrequency}
                            initiallyFocusedItemKey={autoReportingFrequency}
                            addBottomSafeAreaPadding
                            shouldUpdateFocusedIndex
                        />
                    </OfflineWithFeedback>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export type {AutoReportingFrequencyDisplayNames, AutoReportingFrequencyKey};
export {getAutoReportingFrequencyDisplayNames};
export default withPolicy(WorkspaceAutoReportingFrequencyPage);
