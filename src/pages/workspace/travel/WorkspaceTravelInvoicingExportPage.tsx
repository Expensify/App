import {endOfMonth, format, startOfMonth} from 'date-fns';
import React, {useCallback, useEffect, useRef, useState} from 'react';
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
import {exportTravelInvoiceStatementCSV, getTravelInvoiceStatementPDF} from '@libs/actions/TravelInvoicing';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDateRangeForPreset, getRangeBoundariesFromFormValue, isSearchDatePreset} from '@libs/SearchQueryUtils';
import {downloadTravelInvoiceStatementPDF} from '@libs/TravelInvoicingUtils';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceTravelInvoicingExportPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_EXPORT>;

function WorkspaceTravelInvoicingExportPage({route}: WorkspaceTravelInvoicingExportPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [travelInvoiceStatement] = useOnyx(ONYXKEYS.TRAVEL_INVOICE_STATEMENT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const isGenerating = travelInvoiceStatement?.isGenerating ?? false;
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
     * or both AFTER and BEFORE are set. A single After or Before alone is
     * incomplete — we don't silently fill in today's date for the missing value
     * because that can produce invalid ranges the backend rejects.
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
        if (rangeStart && rangeEnd) {
            return true;
        }

        // Both after and before must be set for a complete range
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- We intentionally use logical OR (||) instead of ?? because these values are strings and we want to treat empty strings as "not set" (i.e., falsy).
        return !!(values[CONST.SEARCH.DATE_MODIFIERS.AFTER] && values[CONST.SEARCH.DATE_MODIFIERS.BEFORE]);
    };

    /**
     * Checks whether the selected date range is invalid (start date is after end date).
     */
    const isDateRangeInvalid = (valuesToValidate?: SearchDateValues): boolean => {
        const values = valuesToValidate ?? dateFilterBaseRef.current?.getDateValues();
        const dateAfter = values?.[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        const dateBefore = values?.[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
        const {from: rangeStart, to: rangeEnd} = getSelectedRangeBoundaries(values);

        if (rangeStart && rangeEnd && rangeStart > rangeEnd) {
            return true;
        }

        if (dateAfter && dateBefore && dateAfter > dateBefore) {
            return true;
        }
        return false;
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
     * assumes the selection is complete (ON is set, or both AFTER and BEFORE are set).
     */
    const getDateRange = useCallback((): {startDate: string; endDate: string} => {
        const values = dateFilterBaseRef.current?.getDateValues();
        const dateOn = values?.[CONST.SEARCH.DATE_MODIFIERS.ON];
        const dateAfter = values?.[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        const dateBefore = values?.[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
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

        if (dateAfter && dateBefore) {
            return {
                startDate: dateAfter,
                endDate: dateBefore,
            };
        }

        // Default: this month (only reached on initial mount before any interaction)
        const now = new Date();
        return {
            startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
            endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
    }, []);

    /**
     * Handles PDF export — always requests fresh generation from the backend.
     * The useEffect below auto-downloads the file once generation completes.
     */
    const processDownload = useCallback(() => {
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
        getTravelInvoiceStatementPDF(policyID, startDate, endDate);
    }, [getDateRange, hasDateSelected, isDateRangeInvalid, isGenerating, policyID, translate]);

    useEffect(() => {
        if (!prevIsGenerating || isGenerating) {
            return;
        }

        // Generation just completed — download the file
        const {startDate, endDate} = getDateRange();
        const cacheKey = `${policyID}_${startDate}_${endDate}`;
        const fileName = travelInvoiceStatement?.[cacheKey];
        if (typeof fileName === 'string') {
            downloadTravelInvoiceStatementPDF(translate, baseURL, fileName, startDate, endDate, currentUserPersonalDetails?.login ?? '', session?.encryptedAuthToken ?? '').finally(() =>
                setIsDownloading(false),
            );
        } else {
            // Intentional: this setState resets the loading indicator when generation completes but no file is available.
            // It runs in a cleanup path of the effect, not as a cascading re-render trigger.
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsDownloading(false);
        }
    }, [prevIsGenerating, isGenerating, travelInvoiceStatement, policyID, getDateRange, translate, baseURL, currentUserPersonalDetails?.login, session?.encryptedAuthToken]);

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
        exportTravelInvoiceStatementCSV(policyID, startDate, endDate, translate);
    };

    const goBack = () => dateFilterBaseRef.current?.goBack() ?? Navigation.goBack();

    // Handled by the generic component automatically calling its internal exposed methods.
    // It updates its own internal refs/states so the parent just needs to call save without doing anything else.
    // And when it saves, the parent just needs it available in ref when export uses getDateValues.
    const onSubmit = () => {};

    const defaultDateValues = getDefaultDateValues();

    return (
        <ScreenWrapper
            testID="WorkspaceTravelInvoicingExportPage"
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
                    defaultDateValues={defaultDateValues}
                    presets={presets}
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
                            text={translate('workspace.moreFeatures.travel.travelInvoicing.exportToPDF')}
                            style={[styles.mh4, styles.mt3]}
                            onPress={processDownload}
                            isLoading={isDownloading}
                            large
                        />
                        <Button
                            text={translate('workspace.moreFeatures.travel.travelInvoicing.exportToCSV')}
                            style={[styles.m4, styles.mt3, styles.mb5]}
                            onPress={handleDownloadCSV}
                            success
                            large
                        />
                    </>
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

WorkspaceTravelInvoicingExportPage.displayName = 'WorkspaceTravelInvoicingExportPage';

export default WorkspaceTravelInvoicingExportPage;
