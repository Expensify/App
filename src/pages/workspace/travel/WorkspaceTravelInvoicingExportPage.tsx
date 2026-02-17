import {endOfMonth, format, startOfMonth} from 'date-fns';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import DatePresetFilterBase from '@components/Search/FilterComponents/DatePresetFilterBase';
import type {SearchDatePresetFilterBaseHandle, SearchDateValues} from '@components/Search/FilterComponents/DatePresetFilterBase';
import type {SearchDatePreset} from '@components/Search/types';
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
import type {SearchDateModifier} from '@libs/SearchUIUtils';
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
    const [travelInvoiceStatement] = useOnyx(ONYXKEYS.TRAVEL_INVOICE_STATEMENT, {canBeMissing: true});

    const isGenerating = travelInvoiceStatement?.isGenerating ?? false;
    const prevIsGenerating = usePrevious(isGenerating);
    const [isDownloading, setIsDownloading] = useState(isGenerating);

    const baseURL = addTrailingForwardSlash(getOldDotURLFromEnvironment(environment));

    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    const presets: SearchDatePreset[] = [CONST.SEARCH.DATE_PRESETS.THIS_MONTH, CONST.SEARCH.DATE_PRESETS.LAST_MONTH];

    const defaultDateValues = useMemo(
        (): SearchDateValues => ({
            // Default to This month
            [CONST.SEARCH.DATE_MODIFIERS.ON]: CONST.SEARCH.DATE_PRESETS.THIS_MONTH,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
        }),
        [],
    );

    /**
     * Computes startDate and endDate in YYYY-MM-DD format from the current date selection.
     */
    const getDateRange = useCallback((): {startDate: string; endDate: string} => {
        const values = searchDatePresetFilterBaseRef.current?.getDateValues();
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

        const {startDate, endDate} = getDateRange();
        const cacheKey = `${policyID}_${startDate}_${endDate}`;

        setIsDownloading(true);

        if (travelInvoiceStatement?.[cacheKey]) {
            // We already have a cached file for this statement, download it immediately
            const fileName = travelInvoiceStatement[cacheKey];
            downloadTravelInvoiceStatementPDF(translate, baseURL, fileName, startDate, endDate).finally(() => setIsDownloading(false));
            return;
        }

        // Request PDF generation — the useEffect will auto-download when it completes
        getTravelInvoiceStatementPDF(policyID, startDate, endDate);
    }, [baseURL, isGenerating, getDateRange, translate, travelInvoiceStatement, policyID]);

    // eslint-disable-next-line rulesdir/prefer-early-return
    useEffect(() => {
        // If the statement generation is complete, download it automatically.
        if (prevIsGenerating && !isGenerating) {
            const {startDate, endDate} = getDateRange();
            const cacheKey = `${policyID}_${startDate}_${endDate}`;
            if (travelInvoiceStatement?.[cacheKey]) {
                processDownload();
            } else {
                setIsDownloading(false);
            }
        }
    }, [prevIsGenerating, isGenerating, processDownload, travelInvoiceStatement, policyID, getDateRange]);

    const handleDownloadCSV = useCallback(() => {
        const {startDate, endDate} = getDateRange();
        exportTravelInvoiceStatementCSV(policyID, startDate, endDate, translate);
    }, [getDateRange, policyID, translate]);

    function getComputedTitle() {
        if (selectedDateModifier) {
            return translate(`common.${selectedDateModifier.toLowerCase() as Lowercase<SearchDateModifier>}`);
        }
        return translate('common.export');
    }

    const goBack = () => {
        if (selectedDateModifier) {
            setSelectedDateModifier(null);
            return;
        }
        Navigation.goBack();
    };

    const save = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current || !selectedDateModifier) {
            return;
        }

        searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
        setSelectedDateModifier(null);
    }, [selectedDateModifier]);

    const reset = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            setSelectedDateModifier(null);
            return;
        }

        searchDatePresetFilterBaseRef.current.clearDateValues();
    }, [selectedDateModifier]);

    const computedTitle = getComputedTitle();

    return (
        <ScreenWrapper
            testID="WorkspaceTravelInvoicingExportPage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={computedTitle}
                onBackButtonPress={goBack}
            />
            <FullPageOfflineBlockingView>
                <ScrollView contentContainerStyle={styles.flexGrow1}>
                    <DatePresetFilterBase
                        ref={searchDatePresetFilterBaseRef}
                        defaultDateValues={defaultDateValues}
                        selectedDateModifier={selectedDateModifier}
                        onSelectDateModifier={setSelectedDateModifier}
                        presets={presets}
                    />
                </ScrollView>
                <View style={[styles.ph5, styles.pb5]}>
                    {/* When date modifier is set (On, After and Before) show Reset / Save buttons, otherwise show Export buttons */}
                    {!selectedDateModifier ? (
                        <>
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
                        </>
                    ) : (
                        <>
                            <Button
                                text={translate('common.reset')}
                                onPress={reset}
                                style={styles.mb3}
                                large
                            />
                            <FormAlertWithSubmitButton
                                buttonText={translate('common.save')}
                                onSubmit={save}
                                enabledWhenOffline
                            />
                        </>
                    )}
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

WorkspaceTravelInvoicingExportPage.displayName = 'WorkspaceTravelInvoicingExportPage';

export default WorkspaceTravelInvoicingExportPage;
