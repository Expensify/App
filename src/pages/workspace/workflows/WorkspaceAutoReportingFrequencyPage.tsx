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
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Policy from '@userActions/Policy';
import CONST from '@src/CONST';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type AutoReportingFrequencyKey = Exclude<ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>, 'instant'>;

type WorkspaceAutoReportingFrequencyPageProps = WithPolicyAndFullscreenLoadingProps;

type WorkspaceAutoReportingFrequencyPageSectionItem = {
    text: string;
    keyForList: string;
    isSelected: boolean;
};

type AutoReportingFrequencyDisplayNames = Record<AutoReportingFrequencyKey, string>;

const autoReportingFrequencyDisplayNames: AutoReportingFrequencyDisplayNames = {
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY]: 'Monthly',
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE]: 'Daily',
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]: 'Weekly',
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.SEMI_MONTHLY]: 'Twice a month',
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.TRIP]: 'By trip',
    [CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL]: 'Manually',
};

const DAYS_OF_MONTH = 29;

function WorkspaceAutoReportingFrequencyPage({policy}: WorkspaceAutoReportingFrequencyPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [isMonthlyFrequency, setIsMonthlyFrequency] = useState(policy?.autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY);

    const autoReportingFrequencyItems: WorkspaceAutoReportingFrequencyPageSectionItem[] = Object.keys(autoReportingFrequencyDisplayNames).map((frequencyKey) => {
        const isSelected = policy?.autoReportingFrequency === frequencyKey;

        return {
            text: autoReportingFrequencyDisplayNames[frequencyKey as AutoReportingFrequencyKey] || '',
            keyForList: frequencyKey,
            isSelected,
        };
    });

    const onSelectAutoReportingFrequency = (item: WorkspaceAutoReportingFrequencyPageSectionItem) => {
        Policy.setWorkspaceAutoReportingFrequency(policy?.id ?? '', item.keyForList as AutoReportingFrequencyKey);
        if (item.keyForList !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY) {
            Navigation.goBack();
        }
        setIsMonthlyFrequency(true);
    };

    // Generate days of month for the monthly frequency
    const daysOfMonth = Array.from({length: DAYS_OF_MONTH}, (value, index) => {
        const day = index + 1;
        let suffix = 'th';
        if (day === 1 || day === 21) {
            suffix = 'st';
        } else if (day === 2 || day === 22) {
            suffix = 'nd';
        } else if (day === 3 || day === 23) {
            suffix = 'rd';
        }

        return `${day}${suffix}`;
    }).concat(['Last day of month', 'Last business day of the month']);

    const monthlyFrequencyDetails = () => (
        <OfflineWithFeedback pendingAction={policy?.pendingFields?.autoReportingOffset}>
            <MenuItem
                title={translate('workflowsPage.submissionFrequencyDateOfMonth')}
                titleStyle={styles.textLabelSupportingNormal}
                description={daysOfMonth[0]}
                descriptionTextStyle={styles.textNormalThemeText}
                wrapperStyle={styles.pr3}
                shouldShowRightIcon
            />
        </OfflineWithFeedback>
    );

    const renderItem = ({item}: {item: WorkspaceAutoReportingFrequencyPageSectionItem}) => (
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
        <OfflineWithFeedback
            pendingAction={policy?.pendingFields?.autoReportingFrequency}
            shouldShowErrorMessages
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
                        onBackButtonPress={() => Navigation.goBack()}
                    />

                    <FlatList
                        data={autoReportingFrequencyItems}
                        renderItem={renderItem}
                        keyExtractor={(item: WorkspaceAutoReportingFrequencyPageSectionItem) => item.text}
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </OfflineWithFeedback>
    );
}

WorkspaceAutoReportingFrequencyPage.displayName = 'WorkspaceAutoReportingFrequencyPage';
export type {AutoReportingFrequencyDisplayNames, AutoReportingFrequencyKey};
export {autoReportingFrequencyDisplayNames};
export default withPolicy(WorkspaceAutoReportingFrequencyPage);
