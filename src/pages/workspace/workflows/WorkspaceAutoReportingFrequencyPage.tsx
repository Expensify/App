import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import Button from '@components/Button';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import Icon from '@components/Icon';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
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
import {getAutoReportingOffsetDisplayName, getFrequencyDisplayName, getSubmissionFrequencyHelperText, getWeekdayKey, sortSemiMonthlyOffsets} from '@libs/SubmissionScheduleUtils';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';

import {clearPolicyErrorField, setWorkspaceAutoReportingFrequency, setWorkspaceAutoReportingMonthlyOffset} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkspaceSubmissionFrequencyForm';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import React, {useEffect} from 'react';
import {View} from 'react-native';

import useSubmissionFrequencyDraft from './useSubmissionFrequencyDraft';

type WorkspaceAutoReportingFrequencyPageProps = WithPolicyOnyxProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_AUTO_REPORTING_FREQUENCY>;

type AutoReportingFrequencyDisplayNames = Record<Exclude<AutoReportingFrequency, typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT>, string> & {
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT]?: string;
};

const FREQUENCY_ORDER: AutoReportingFrequency[] = [
    CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
    CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
    CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY,
    CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY,
    CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY,
    CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP,
    CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL,
];

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
    const {translate, toLocaleOrdinal} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {environmentURL} = useEnvironment();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Clock']);
    const getReviewWorkspaceSettingsTaskCompletion = useReviewWorkspaceSettingsTaskCompletion();
    const policyID = policy?.id;

    useEffect(() => () => clearDraftValues(ONYXKEYS.FORMS.WORKSPACE_SUBMISSION_FREQUENCY_FORM), []);
    const {selectedFrequency, isSavedFrequencySelected, offset, secondOffset, hasChanges} = useSubmissionFrequencyDraft(policy);

    const onSelectFrequency = (frequency: AutoReportingFrequency) => {
        setDraftValues(ONYXKEYS.FORMS.WORKSPACE_SUBMISSION_FREQUENCY_FORM, {[INPUT_IDS.FREQUENCY]: frequency, [INPUT_IDS.OFFSET]: '', [INPUT_IDS.SECOND_OFFSET]: ''});
    };

    const save = () => {
        if (!policyID || !selectedFrequency) {
            return;
        }
        const reviewWorkspaceSettingsTaskData = getReviewWorkspaceSettingsTaskCompletion();
        if (!isSavedFrequencySelected) {
            setWorkspaceAutoReportingFrequency(policyID, selectedFrequency, policy?.autoReportingFrequency, policy?.harvesting, reviewWorkspaceSettingsTaskData);
        }
        if (offset !== undefined && hasChanges) {
            const offsetsToSave = selectedFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY ? sortSemiMonthlyOffsets({offset, secondOffset}) : {offset, secondOffset};
            setWorkspaceAutoReportingMonthlyOffset(
                policyID,
                offsetsToSave.offset ?? offset,
                policy?.autoReportingOffset,
                isSavedFrequencySelected ? reviewWorkspaceSettingsTaskData : {},
                offsetsToSave.secondOffset,
                policy?.autoReportingOffsetSecondSemiMonthly,
            );
        }
        Navigation.goBack();
    };

    const autoReportingFrequencyDisplayNames = getAutoReportingFrequencyDisplayNames(translate, isSubmitPolicy(policy));
    const frequencyOptions = FREQUENCY_ORDER.filter((frequency) => !!autoReportingFrequencyDisplayNames[frequency]).map((frequency) => ({
        key: frequency,
        text: getFrequencyDisplayName(frequency, translate),
    }));

    const renderOffsetRow = (name: string, value: string, onPress: () => void, isSecondOffset = false) => (
        <OfflineWithFeedback
            pendingAction={isSecondOffset ? policy?.pendingFields?.autoReportingOffsetSecondSemiMonthly : policy?.pendingFields?.autoReportingOffset}
            errors={isSecondOffset ? undefined : getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET)}
            onClose={() => clearPolicyErrorField(policyID, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING_OFFSET)}
            errorRowStyles={[styles.ph5]}
        >
            <MenuItemField
                name={name}
                value={value}
                onPress={onPress}
                sentryLabel={isSecondOffset ? CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.AUTO_REPORTING_SECOND_OFFSET : CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.AUTO_REPORTING_OFFSET}
            />
        </OfflineWithFeedback>
    );

    const renderSectionHeader = (title: string) => <Text style={[styles.textStrong, styles.ph5, styles.mt6, styles.mb2]}>{title}</Text>;

    const renderSubmitOnRows = () => {
        switch (selectedFrequency) {
            case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY:
                return (
                    <>
                        {renderSectionHeader(translate('workflowsPage.submitOn'))}
                        {renderOffsetRow(translate('workflowsPage.dayOfTheWeek'), translate(`workflowsPage.daysOfWeek.${getWeekdayKey(Number(offset))}`), () =>
                            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_WEEKLY_OFFSET.getRoute(policyID)),
                        )}
                    </>
                );
            case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY:
                return (
                    <>
                        {renderSectionHeader(translate('workflowsPage.firstSubmission'))}
                        {renderOffsetRow(translate('workflowsPage.dayOfTheMonth'), getAutoReportingOffsetDisplayName(offset, translate, toLocaleOrdinal), () =>
                            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_SEMI_MONTHLY_OFFSET.getRoute(policyID, CONST.POLICY.SEMI_MONTHLY_SUBMISSIONS.FIRST)),
                        )}
                        {renderSectionHeader(translate('workflowsPage.secondSubmission'))}
                        {renderOffsetRow(
                            translate('workflowsPage.dayOfTheMonth'),
                            getAutoReportingOffsetDisplayName(secondOffset, translate, toLocaleOrdinal),
                            () => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_SEMI_MONTHLY_OFFSET.getRoute(policyID, CONST.POLICY.SEMI_MONTHLY_SUBMISSIONS.SECOND)),
                            true,
                        )}
                    </>
                );
            case CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY:
                return (
                    <>
                        {renderSectionHeader(translate('workflowsPage.submitOn'))}
                        {renderOffsetRow(translate('workflowsPage.dayOfTheMonth'), getAutoReportingOffsetDisplayName(offset, translate, toLocaleOrdinal), () =>
                            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET.getRoute(policyID)),
                        )}
                    </>
                );
            default:
                return null;
        }
    };

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
                            <Text style={[styles.textStrong, styles.ph5, styles.mb3]}>{translate('workflowsPage.submitFrequency')}</Text>
                            <PillSelector
                                options={frequencyOptions}
                                selectedKey={selectedFrequency}
                                onSelect={onSelectFrequency}
                                style={styles.ph5}
                            />
                        </OfflineWithFeedback>
                        {renderSubmitOnRows()}
                    </ScrollView>
                    <FixedFooter
                        style={styles.mtAuto}
                        addBottomSafeAreaPadding
                    >
                        {!!selectedFrequency && (
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb4]}>
                                <Icon
                                    src={expensifyIcons.Clock}
                                    fill={theme.icon}
                                    additionalStyles={styles.popoverMenuIcon}
                                />
                                <View style={[styles.flex1, styles.ml3]}>
                                    <RenderHTML html={`<muted-text>${getSubmissionFrequencyHelperText(selectedFrequency, timezoneLink, translate)}</muted-text>`} />
                                </View>
                            </View>
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
