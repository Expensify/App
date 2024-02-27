import React, {useState} from 'react';
import {FlatList} from 'react-native-gesture-handler';
import type {ValueOf} from 'type-fest';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {translate as globalTranslate} from '@libs/Localize';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyOnyxProps} from '@pages/workspace/withPolicy';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type AutoReportingFrequencyKey = Exclude<ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>, 'instant'>;

type WorkspaceAutoReportingFrequencyPageProps = WithPolicyOnyxProps;

type WorkspaceAutoReportingFrequencyPageItem = {
    text: string;
    keyForList: string;
    isSelected: boolean;
};

type AutoReportingFrequencyDisplayNames = Record<AutoReportingFrequencyKey, string>;

const getAutoReportingFrequencyDisplayNames = (locale: 'en' | 'es' | 'es-ES' | 'es_ES'): AutoReportingFrequencyDisplayNames => ({
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY]: globalTranslate(locale, 'workflowsPage.frequencies.monthly'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE]: globalTranslate(locale, 'workflowsPage.frequencies.daily'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]: globalTranslate(locale, 'workflowsPage.frequencies.weekly'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY]: globalTranslate(locale, 'workflowsPage.frequencies.twiceAMonth'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP]: globalTranslate(locale, 'workflowsPage.frequencies.byTrip'),
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL]: globalTranslate(locale, 'workflowsPage.frequencies.manually'),
});

const FIRST_DAY_OF_MONTH = '1st';

function WorkspaceAutoReportingFrequencyPage({policy}: WorkspaceAutoReportingFrequencyPageProps) {
    const {translate, preferredLocale} = useLocalize();
    const styles = useThemeStyles();
    const [isMonthlyFrequency, setIsMonthlyFrequency] = useState(policy?.autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY);

    const autoReportingFrequencyItems: WorkspaceAutoReportingFrequencyPageItem[] = Object.keys(getAutoReportingFrequencyDisplayNames(preferredLocale)).map((frequencyKey) => {
        const isSelected = policy?.autoReportingFrequency === frequencyKey;

        return {
            text: getAutoReportingFrequencyDisplayNames(preferredLocale)[frequencyKey as AutoReportingFrequencyKey] || '',
            keyForList: frequencyKey,
            isSelected,
        };
    });

    const onSelectAutoReportingFrequency = (item: WorkspaceAutoReportingFrequencyPageItem) => {
        Policy.setWorkspaceAutoReportingFrequency(policy?.id ?? '', item.keyForList as AutoReportingFrequencyKey);
        if (item.keyForList !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY) {
            setIsMonthlyFrequency(false);
            Navigation.goBack();
        } else {
            setIsMonthlyFrequency(true);
        }
    };

    const getDescriptionText = () => {
        if (policy?.autoReportingOffset === undefined) {
            return FIRST_DAY_OF_MONTH;
        }
        if (typeof policy?.autoReportingOffset === 'number') {
            let suffix = 'th';
            if (policy.autoReportingOffset === 1 || policy.autoReportingOffset === 21 || policy.autoReportingOffset === 31) {
                suffix = 'st';
            } else if (policy.autoReportingOffset === 2 || policy.autoReportingOffset === 22) {
                suffix = 'nd';
            } else if (policy.autoReportingOffset === 3 || policy.autoReportingOffset === 23) {
                suffix = 'rd';
            }
            return `${policy.autoReportingOffset}${suffix}`;
        }
        return translate(`workflowsPage.frequencies.${policy?.autoReportingOffset}`);
    };

    const monthlyFrequencyDetails = () => (
        <OfflineWithFeedback pendingAction={policy?.pendingFields?.autoReportingOffset}>
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

    const renderItem = ({item}: {item: WorkspaceAutoReportingFrequencyPageItem}) => (
        <>
            <RadioListItem
                item={item}
                onSelectRow={() => onSelectAutoReportingFrequency(item)}
                showTooltip={false}
            />
            {isMonthlyFrequency && item.keyForList === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY ? monthlyFrequencyDetails() : null}
        </>
    );

    return (
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

                <FlatList
                    data={autoReportingFrequencyItems}
                    renderItem={renderItem}
                    keyExtractor={(item: WorkspaceAutoReportingFrequencyPageItem) => item.text}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

WorkspaceAutoReportingFrequencyPage.displayName = 'WorkspaceAutoReportingFrequencyPage';
export type {AutoReportingFrequencyDisplayNames, AutoReportingFrequencyKey};
export {getAutoReportingFrequencyDisplayNames};
export default withPolicy(WorkspaceAutoReportingFrequencyPage);
