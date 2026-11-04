import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import Icon from '@components/Icon';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PillSelector from '@components/PillSelector';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';

import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useReviewWorkspaceSettingsTaskCompletion from '@hooks/useReviewWorkspaceSettingsTaskCompletion';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearDraftValues, setDraftValues} from '@libs/actions/FormActions';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {canEditWorkspaceSettings, goBackFromInvalidPolicy, isGroupPolicy, isPendingDeletePolicy, isSubmitPolicy} from '@libs/PolicyUtils';
import type {AutoReportingFrequency} from '@libs/SubmissionScheduleUtils';
import {FREQUENCIES, getFrequencyDisplayName, getSubmissionFrequencyHelperText, isSemiMonthlyOffsetOrderValid} from '@libs/SubmissionScheduleUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';

import {clearPolicyErrorField, setWorkspaceAutoReportingFrequency, setWorkspaceAutoReportingOffset} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceSubmissionFrequencyForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect, useState} from 'react';
import {View} from 'react-native';

import AutoReportingSubmitOnRows from './AutoReportingSubmitOnRows';
import useSubmissionFrequencyDraft from './useSubmissionFrequencyDraft';

type WorkspaceAutoReportingFrequencyPageProps = WithPolicyOnyxProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY>;

type AutoReportingFrequencyDisplayNames = Record<Exclude<AutoReportingFrequency, typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT>, string> & {
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT]?: string;
};

const getAutoReportingFrequencyDisplayNames = (translate: LocaleContextProps['translate'], isSubmitWorkspace = false): AutoReportingFrequencyDisplayNames => {
    const displayNames: AutoReportingFrequencyDisplayNames = {
        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY]: translate('workflowsPage.frequencies.monthly'),
        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE]: translate('workflowsPage.frequencies.daily'),
        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]: translate('workflowsPage.frequencies.weekly'),
        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY]: translate('workflowsPage.frequencies.twiceAMonth'),
        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP]: translate('workflowsPage.frequencies.byTrip'),
        [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL]: translate('workflowsPage.frequencies.manually'),
    };

    if (!isSubmitWorkspace) {
        displayNames[CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT] = translate('workflowsPage.frequencies.instant');
    }

    return displayNames;
};

function WorkspaceAutoReportingFrequencyPage({policy, route}: WorkspaceAutoReportingFrequencyPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {environmentURL} = useEnvironment();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Clock']);
    const getReviewWorkspaceSettingsTaskCompletion = useReviewWorkspaceSettingsTaskCompletion();
    const policyID = policy?.id;

    useEffect(() => () => clearDraftValues(ONYXKEYS.FORMS.WORKSPACE_SUBMISSION_FREQUENCY_FORM), []);
    const {selectedFrequency, isSavedFrequencySelected, offset, secondOffset, hasChanges} = useSubmissionFrequencyDraft(policy);
    const [shouldShowOrderError, setShouldShowOrderError] = useState(false);
    const isOffsetOrderValid = selectedFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY || isSemiMonthlyOffsetOrderValid({offset, secondOffset});

    const onSelectFrequency = (frequency: AutoReportingFrequency) => {
        setDraftValues(ONYXKEYS.FORMS.WORKSPACE_SUBMISSION_FREQUENCY_FORM, {[INPUT_IDS.FREQUENCY]: frequency, [INPUT_IDS.OFFSET]: '', [INPUT_IDS.SECOND_OFFSET]: ''});
    };

    const save = () => {
        if (!policyID || !selectedFrequency) {
            return;
        }
        if (!isOffsetOrderValid) {
            setShouldShowOrderError(true);
            return;
        }
        const reviewWorkspaceSettingsTaskData = getReviewWorkspaceSettingsTaskCompletion();
        if (!isSavedFrequencySelected) {
            setWorkspaceAutoReportingFrequency(policyID, selectedFrequency, policy?.autoReportingFrequency, policy?.harvesting, reviewWorkspaceSettingsTaskData);
        }
        if (offset !== undefined && hasChanges) {
            setWorkspaceAutoReportingOffset(
                policyID,
                offset,
                policy?.autoReportingOffset,
                isSavedFrequencySelected ? reviewWorkspaceSettingsTaskData : {},
                secondOffset,
                policy?.autoReportingOffsetSecondSemiMonthly,
            );
        }
        Navigation.goBack();
    };

    const autoReportingFrequencyDisplayNames = getAutoReportingFrequencyDisplayNames(translate, isSubmitPolicy(policy));
    const frequencyOptions = FREQUENCIES.filter((frequency) => !!autoReportingFrequencyDisplayNames[frequency]).map((frequency) => ({
        key: frequency,
        text: getFrequencyDisplayName(frequency, translate),
    }));

    const timezoneLink = `${environmentURL}/${ROUTES.WORKSPACE_OVERVIEW.getRoute(policyID)}`;

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
                    shouldShow={isEmptyObject(policy) || !canEditWorkspaceSettings(policy) || isPendingDeletePolicy(policy) || !isGroupPolicy(policy)}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    addBottomSafeAreaPadding
                >
                    <HeaderWithBackButtonAndTitle
                        title={translate('common.frequency')}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <ScrollView contentContainerStyle={styles.flexGrow1}>
                        <OfflineWithFeedback
                            pendingAction={policy?.pendingFields?.autoReportingFrequency}
                            errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_FREQUENCY)}
                            onClose={() => clearPolicyErrorField(policyID, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_FREQUENCY)}
                            errorRowStyles={[styles.ph5]}
                        >
                            <Text
                                variant="labelStrong"
                                style={[styles.ph5, styles.pv1Half]}
                            >
                                {translate('workflowsPage.submitFrequency')}
                            </Text>
                            <PillSelector
                                options={frequencyOptions}
                                selectedKey={selectedFrequency}
                                onSelect={onSelectFrequency}
                                style={[styles.ph5, styles.pv1]}
                            />
                        </OfflineWithFeedback>
                        <AutoReportingSubmitOnRows
                            policy={policy}
                            frequency={selectedFrequency}
                            isSavedFrequencySelected={isSavedFrequencySelected}
                            offset={offset}
                            secondOffset={secondOffset}
                        />
                    </ScrollView>
                    <FixedFooter
                        style={styles.mtAuto}
                        addBottomSafeAreaPadding
                    >
                        {!!selectedFrequency && (
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                                <Icon
                                    src={expensifyIcons.Clock}
                                    fill={theme.icon}
                                />
                                <View style={[styles.flex1, styles.ml3, styles.flexRow, styles.renderHTML]}>
                                    <RenderHTML html={`<muted-text-label>${getSubmissionFrequencyHelperText(selectedFrequency, timezoneLink, translate)}</muted-text-label>`} />
                                </View>
                            </View>
                        )}
                        {shouldShowOrderError && !isOffsetOrderValid && (
                            <FormHelpMessage
                                message={translate('workflowsPage.submissionDatesOrderError')}
                                style={styles.mb3}
                            />
                        )}
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                            onPress={save}
                            isDisabled={!hasChanges}
                        >
                            <Button.KeyboardShortcut />
                            <Button.Text>{translate('common.save')}</Button.Text>
                        </Button>
                    </FixedFooter>
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export {getAutoReportingFrequencyDisplayNames};
export default withPolicy(WorkspaceAutoReportingFrequencyPage);
