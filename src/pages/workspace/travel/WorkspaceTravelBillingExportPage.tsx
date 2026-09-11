import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import type {DateFilterBaseHandle} from '@components/Search/FilterComponents/DateFilterBase';
import type {SearchDateValues} from '@components/Search/FilterComponents/DatePresetFilterBase';
import type {SearchDatePreset} from '@components/Search/types';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';

import {exportTravelBillingStatementCSV, getTravelBillingStatementPDF} from '@libs/actions/TravelBilling';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDateRangeForPreset, getRangeBoundariesFromFormValue, isSearchDatePreset} from '@libs/SearchQueryUtils';
import {downloadTravelBillingStatementPDF} from '@libs/TravelBillingUtils';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

import {endOfMonth, format, startOfMonth} from 'date-fns';
import React, {useEffect, useRef, useState} from 'react';

type WorkspaceTravelBillingExportPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_EXPORT>;

function WorkspaceTravelBillingExportPage({route}: WorkspaceTravelBillingExportPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [travelBillingStatement] = useOnyx(ONYXKEYS.TRAVEL_BILLING_STATEMENT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const isGenerating = travelBillingStatement?.isGenerating ?? false;
    const prevIsGenerating = usePrevious(isGenerating);
    const [isDownloading, setIsDownloading] = useState(isGenerating);
    const [dateError, setDateError] = useState('');
    const [isDateModifierOpen, setIsDateModifierOpen] = useState(false);

    const baseURL = CONFIG.EXPENSIFY.DEFAULT_API_ROOT;

    const dateFilterBaseRef = useRef<DateFilterBaseHandle>(null);

    const presets: SearchDatePreset[] = [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.DATE_PRESETS.LAST_MONTH];

    function getDefaultDateValues() {
        return {
            [CONST.SEARCH.DATE_MODIFIERS.ON]: CONST.SEARCH.DATE_PRESETS.THIS_MONTH,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
        };
    }

    const getSelectedRangeBoundaries = (valuesToRead?: SearchDateValues) => {
        const values = valuesToRead ?? dateFilterBaseRef.current?.getDateValues();
        return getRangeBoundariesFromFormValue(values?.[CONST.SEARCH.DATE_MODIFIERS.RANGE]);
    };

    /**
     * Checks whether the user has a complete date selection.
     * A selection is complete when either ON is set (preset or specific date),
     * or both range boundaries are set.
     */
    const hasDateSelected = (valuesToValidate?: SearchDateValues): boolean => {
        const values = valuesToValidate ?? dateFilterBaseRef.current?.getDateValues();
        if (!values) {
            return false;
        }

        if (values[CONST.SEARCH.DATE_MODIFIERS.ON]) {
            return true;
        }

        const {from: rangeStart, to: rangeEnd} = getSelectedRangeBoundaries(values);
        return !!(rangeStart && rangeEnd);
    };

    /**
     * Checks whether the selected date range is invalid (start date is after end date).
     */
    const isDateRangeInvalid = (valuesToValidate?: SearchDateValues): boolean => {
        const values = valuesToValidate ?? dateFilterBaseRef.current?.getDateValues();
        const {from: rangeStart, to: rangeEnd} = getSelectedRangeBoundaries(values);

        return !!(rangeStart && rangeEnd && rangeStart > rangeEnd);
    };

    /**
     * Re-validates date selection on every change.
     * Receives the freshest values directly from the DateFilterBase callback,
     * avoiding the need to wait for a re-render to read from the ref.
     */
    const handleDateValuesChange = (newValues: SearchDateValues) => {
        if (!hasDateSelected(newValues)) {
            setDateError(translate('workspace.moreFeatures.travel.travelInvoicing.selectDateRangeError'));
        } else if (isDateRangeInvalid(newValues)) {
            setDateError(translate('workspace.moreFeatures.travel.travelInvoicing.invalidDateRangeError'));
        } else {
            setDateError('');
        }
    };

    /**
     * Computes startDate and endDate in YYYY-MM-DD format from the current date selection.
     * Callers must validate via hasDateSelected() before calling — this function
     * assumes the selection is complete (ON is set, or both range boundaries are set).
     */
    const getDateRange = (): {startDate: string; endDate: string} => {
        const values = dateFilterBaseRef.current?.getDateValues();
        const dateOn = values?.[CONST.SEARCH.DATE_MODIFIERS.ON];
        const {from: rangeStart, to: rangeEnd} = getSelectedRangeBoundaries(values);

        if (dateOn) {
            if (isSearchDatePreset(dateOn)) {
                const range = getDateRangeForPreset(dateOn);
                return {startDate: range.start, endDate: range.end};
            }
            // Specific date "On" -> startDate = endDate
            return {startDate: dateOn, endDate: dateOn};
        }

        if (rangeStart && rangeEnd) {
            return {startDate: rangeStart, endDate: rangeEnd};
        }

        // Default: this month (only reached on initial mount before any interaction)
        const now = new Date();
        return {
            startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
            endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
    };

    /**
     * Handles PDF export — always requests fresh generation from the backend.
     * The useEffect below auto-downloads the file once generation completes.
     */
    const processDownload = () => {
        if (isGenerating) {
            return;
        }

        if (!hasDateSelected()) {
            setDateError(translate('workspace.moreFeatures.travel.travelInvoicing.selectDateRangeError'));
            return;
        }

        if (isDateRangeInvalid()) {
            setDateError(translate('workspace.moreFeatures.travel.travelInvoicing.invalidDateRangeError'));
            return;
        }

        const {startDate, endDate} = getDateRange();

        setIsDownloading(true);
        getTravelBillingStatementPDF(policyID, startDate, endDate);
    };

    useEffect(() => {
        if (!prevIsGenerating || isGenerating) {
            return;
        }

        // Generation just completed — download the file
        const {startDate, endDate} = getDateRange();
        const cacheKey = `${policyID}_${startDate}_${endDate}`;
        const fileName = travelBillingStatement?.[cacheKey];
        if (typeof fileName === 'string') {
            downloadTravelBillingStatementPDF(translate, baseURL, fileName, startDate, endDate, currentUserPersonalDetails?.login ?? '', session?.encryptedAuthToken ?? '').finally(() =>
                setIsDownloading(false),
            );
        } else {
            // Intentional: this setState resets the loading indicator when generation completes but no file is available.
            // It runs in a cleanup path of the effect, not as a cascading re-render trigger.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsDownloading(false);
        }
    }, [prevIsGenerating, isGenerating, travelBillingStatement, policyID, getDateRange, translate, baseURL, currentUserPersonalDetails?.login, session?.encryptedAuthToken]);

    const handleDownloadCSV = () => {
        if (!hasDateSelected()) {
            setDateError(translate('workspace.moreFeatures.travel.travelInvoicing.selectDateRangeError'));
            return;
        }
        if (isDateRangeInvalid()) {
            setDateError(translate('workspace.moreFeatures.travel.travelInvoicing.invalidDateRangeError'));
            return;
        }
        const {startDate, endDate} = getDateRange();
        exportTravelBillingStatementCSV(policyID, startDate, endDate, translate);
    };

    const goBack = () => dateFilterBaseRef.current?.goBack() ?? Navigation.goBack();

    // Handled by the generic component automatically calling its internal exposed methods.
    // It updates its own internal refs/states so the parent just needs to call save without doing anything else.
    // And when it saves, the parent just needs it available in ref when export uses getDateValues.
    const onSubmit = () => {};

    const defaultDateValues = getDefaultDateValues();

    return (
        <ScreenWrapper
            testID="WorkspaceTravelBillingExportPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate('common.export')}
                onBackButtonPress={goBack}
            />
            <FullPageOfflineBlockingView>
                <DateFilterBase
                    ref={dateFilterBaseRef}
                    style={styles.flex1}
                    defaultDateValues={defaultDateValues}
                    presets={presets}
                    shouldShowCustomDate={false}
                    onSubmit={onSubmit}
                    onDateValuesChange={handleDateValuesChange}
                    onDateModifierChange={setIsDateModifierOpen}
                    shouldShowButtonsOnlyWithDateModifier
                    shouldShowHeader={false}
                />
                {!isDateModifierOpen && (
                    <>
                        {!!dateError && (
                            <FormHelpMessage
                                style={[styles.mh4, styles.mt2, styles.mb0]}
                                message={dateError}
                                isError
                            />
                        )}
                        <Button
                            style={[styles.mh4, styles.mt3]}
                            onPress={processDownload}
                            isLoading={isDownloading}
                            size={CONST.BUTTON_SIZE.LARGE}
                        >
                            <Button.Text>{translate('workspace.moreFeatures.travel.travelInvoicing.exportToPDF')}</Button.Text>
                        </Button>
                        <Button
                            style={[styles.m4, styles.mt3, styles.mb5]}
                            onPress={handleDownloadCSV}
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                        >
                            <Button.Text>{translate('workspace.moreFeatures.travel.travelInvoicing.exportToCSV')}</Button.Text>
                        </Button>
                    </>
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

WorkspaceTravelBillingExportPage.displayName = 'WorkspaceTravelBillingExportPage';

export default WorkspaceTravelBillingExportPage;
