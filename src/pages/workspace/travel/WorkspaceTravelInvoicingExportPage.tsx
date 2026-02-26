import {endOfMonth, format, startOfMonth} from 'date-fns';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import ScreenWrapper from '@components/ScreenWrapper';
import DateFilterBase from '@components/Search/FilterComponents/DateFilterBase';
import type {DateFilterBaseHandle} from '@components/Search/FilterComponents/DateFilterBase';
import type {SearchDatePreset} from '@components/Search/types';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useThemeStyles from '@hooks/useThemeStyles';
import {exportTravelInvoiceStatementCSV, getTravelInvoiceStatementPDF} from '@libs/actions/TravelInvoicing';
import {getOldDotURLFromEnvironment} from '@libs/Environment/Environment';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {isSearchDatePreset} from '@libs/SearchQueryUtils';
import {getDateRangeForPreset} from '@libs/SearchUIUtils';
import {downloadTravelInvoiceStatementPDF} from '@libs/TravelInvoicingUtils';
import addTrailingForwardSlash from '@libs/UrlUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type WorkspaceTravelInvoicingExportPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_EXPORT>;

function WorkspaceTravelInvoicingExportPage({route}: WorkspaceTravelInvoicingExportPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {environment} = useEnvironment();
    const [travelInvoiceStatement] = useOnyx(ONYXKEYS.TRAVEL_INVOICE_STATEMENT);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const isGenerating = travelInvoiceStatement?.isGenerating ?? false;
    const prevIsGenerating = usePrevious(isGenerating);
    const [isDownloading, setIsDownloading] = useState(isGenerating);
    const [dateError, setDateError] = useState('');
    const [isDateModifierOpen, setIsDateModifierOpen] = useState(false);

    const baseURL = addTrailingForwardSlash(getOldDotURLFromEnvironment(environment));

    const dateFilterBaseRef = useRef<DateFilterBaseHandle>(null);

    const presets: SearchDatePreset[] = [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.DATE_PRESETS.LAST_MONTH];

    function getDefaultDateValues() {
        return {
            [CONST.SEARCH.DATE_MODIFIERS.ON]: CONST.SEARCH.DATE_PRESETS.THIS_MONTH,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
        };
    }

    /**
     * Checks whether the user has selected any date value via the date filter.
     */
    const hasDateSelected = useCallback((): boolean => {
        const values = dateFilterBaseRef.current?.getDateValues();
        if (!values) {
            return false;
        }
        return !!(values[CONST.SEARCH.DATE_MODIFIERS.ON] || values[CONST.SEARCH.DATE_MODIFIERS.AFTER] || values[CONST.SEARCH.DATE_MODIFIERS.BEFORE]);
    }, []);

    /**
     * Computes startDate and endDate in YYYY-MM-DD format from the current date selection.
     */
    const getDateRange = useCallback((): {startDate: string; endDate: string} => {
        const values = dateFilterBaseRef.current?.getDateValues();
        const dateOn = values?.[CONST.SEARCH.DATE_MODIFIERS.ON];
        const dateAfter = values?.[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        const dateBefore = values?.[CONST.SEARCH.DATE_MODIFIERS.BEFORE];

        if (dateOn) {
            if (isSearchDatePreset(dateOn)) {
                const range = getDateRangeForPreset(dateOn);
                return {startDate: range.start, endDate: range.end};
            }
            // Specific date "On" -> startDate = endDate
            return {startDate: dateOn, endDate: dateOn};
        }

        if (dateAfter || dateBefore) {
            const now = format(new Date(), 'yyyy-MM-dd');
            return {
                startDate: dateAfter ?? now,
                endDate: dateBefore ?? now,
            };
        }

        // Default: this month
        const now = new Date();
        return {
            startDate: format(startOfMonth(now), 'yyyy-MM-dd'),
            endDate: format(endOfMonth(now), 'yyyy-MM-dd'),
        };
    }, []);

    /**
     * Handles PDF download — mirrors WalletStatementPage.processDownload pattern.
     * Checks for cached filename first; if found downloads immediately, otherwise starts generation.
     */
    const processDownload = useCallback(() => {
        if (isGenerating) {
            return;
        }

        if (!hasDateSelected()) {
            setDateError(translate('workspace.moreFeatures.travel.travelInvoicing.selectDateRangeError'));
            return;
        }

        const {startDate, endDate} = getDateRange();
        const cacheKey = `${policyID}_${startDate}_${endDate}`;

        setIsDownloading(true);

        if (typeof travelInvoiceStatement?.[cacheKey] === 'string') {
            // We already have a cached file for this statement, download it immediately
            const fileName = travelInvoiceStatement[cacheKey];
            downloadTravelInvoiceStatementPDF(translate, baseURL, fileName, startDate, endDate, currentUserPersonalDetails?.login ?? '').finally(() => setIsDownloading(false));
            return;
        }

        // Request PDF generation — the useEffect will auto-download when it completes
        getTravelInvoiceStatementPDF(policyID, startDate, endDate);
    }, [baseURL, isGenerating, getDateRange, translate, travelInvoiceStatement, policyID, currentUserPersonalDetails?.login, hasDateSelected]);

    useEffect(() => {
        if (!prevIsGenerating || isGenerating) {
            return;
        }

        // If the statement generation is complete, download it automatically
        const {startDate, endDate} = getDateRange();
        const cacheKey = `${policyID}_${startDate}_${endDate}`;
        if (travelInvoiceStatement?.[cacheKey]) {
            processDownload();
        } else {
            setIsDownloading(false);
        }
    }, [prevIsGenerating, isGenerating, processDownload, travelInvoiceStatement, policyID, getDateRange]);

    const handleDownloadCSV = () => {
        if (!hasDateSelected()) {
            setDateError(translate('workspace.moreFeatures.travel.travelInvoicing.selectDateRangeError'));
            return;
        }
        const {startDate, endDate} = getDateRange();
        exportTravelInvoiceStatementCSV(policyID, startDate, endDate, translate);
    };

    const goBack = () => Navigation.goBack();

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
            <FullPageOfflineBlockingView>
                <DateFilterBase
                    ref={dateFilterBaseRef}
                    title={translate('common.export')}
                    defaultDateValues={defaultDateValues}
                    presets={presets}
                    onBackButtonPress={goBack}
                    onSubmit={onSubmit}
                    onDateValuesChange={() => setDateError('')}
                    onDateModifierChange={setIsDateModifierOpen}
                />
                {!isDateModifierOpen && (
                    <View style={[styles.ph5, styles.pb5]}>
                        {!!dateError && <Text style={[styles.textDanger, styles.mb3, styles.textAlignCenter]}>{dateError}</Text>}
                        <Button
                            text={translate('workspace.moreFeatures.travel.travelInvoicing.exportToPDF')}
                            onPress={processDownload}
                            isLoading={isDownloading}
                            large
                            style={styles.mb3}
                        />
                        <Button
                            success
                            text={translate('workspace.moreFeatures.travel.travelInvoicing.exportToCSV')}
                            onPress={handleDownloadCSV}
                            large
                        />
                    </View>
                )}
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

WorkspaceTravelInvoicingExportPage.displayName = 'WorkspaceTravelInvoicingExportPage';

export default WorkspaceTravelInvoicingExportPage;
