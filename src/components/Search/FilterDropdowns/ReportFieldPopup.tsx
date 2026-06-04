import React, {useRef, useState} from 'react';
import ReportFieldBase from '@components/Search/FilterComponents/ReportField';
import type {ReportFieldHandle} from '@components/Search/FilterComponents/ReportField';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import type {PolicyReportField} from '@src/types/onyx';
import BasePopup from './BasePopup';

type ReportFieldPopupProps = {
    values: Partial<SearchAdvancedFiltersForm>;
    closeOverlay: () => void;
    updateFilterForm: (value: Partial<SearchAdvancedFiltersForm>) => void;
};

function ReportFieldPopup({values, closeOverlay, updateFilterForm}: ReportFieldPopupProps) {
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const isInLandscapeMode = useIsInLandscapeMode();
    const styles = useThemeStyles();
    const [selectedField, setSelectedField] = useState<PolicyReportField | null>(null);
    const reportFieldRef = useRef<ReportFieldHandle>(null);

    const applyChanges = () => {
        if (!reportFieldRef.current) {
            return;
        }

        if (selectedField) {
            reportFieldRef.current.applySelectedFieldAndGoBack();
            return;
        }

        updateFilterForm(reportFieldRef.current.getValue());
        closeOverlay();
    };

    const resetChanges = () => {
        if (!reportFieldRef.current) {
            return;
        }

        if (selectedField) {
            reportFieldRef.current.resetSelectedFieldAndGoBack();
            return;
        }

        updateFilterForm(reportFieldRef.current.getEmptyValue());
        closeOverlay();
    };

    return (
        <BasePopup
            label={selectedField ? undefined : translate('workspace.common.reportField')}
            onReset={resetChanges}
            onApply={applyChanges}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_REPORT_FIELD}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_REPORT_FIELD}
            style={[styles.getPopoverMaxHeight(windowHeight, isInLandscapeMode)]}
        >
            <ReportFieldBase
                ref={reportFieldRef}
                values={values}
                selectedField={selectedField}
                onFieldSelected={setSelectedField}
            />
        </BasePopup>
    );
}

export default ReportFieldPopup;
