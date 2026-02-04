import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {validateDateTimeIsAtLeastOneMinuteInFuture} from '@libs/ValidationUtils';
import {updateDraftCustomStatus, updateStatusDraftCustomClearAfterDate} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type CustomStatusTypes = ValueOf<typeof CONST.CUSTOM_STATUS_TYPES>;

type StatusType = {
    value: CustomStatusTypes;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

/**
 * @param data - either a value from CONST.CUSTOM_STATUS_TYPES or a dateTime string in the format YYYY-MM-DD HH:mm
 */
function getSelectedStatusType(data: string): CustomStatusTypes {
    switch (data) {
        case DateUtils.getEndOfToday():
            return CONST.CUSTOM_STATUS_TYPES.AFTER_TODAY;
        case CONST.CUSTOM_STATUS_TYPES.NEVER:
        case '':
            return CONST.CUSTOM_STATUS_TYPES.NEVER;
        default:
            return CONST.CUSTOM_STATUS_TYPES.CUSTOM;
    }
}

const useValidateCustomDate = (translate: LocalizedTranslate, data: string) => {
    const [customDateError, setCustomDateError] = useState('');
    const [customTimeError, setCustomTimeError] = useState('');
    const validate = () => {
        const {dateValidationErrorKey, timeValidationErrorKey} = validateDateTimeIsAtLeastOneMinuteInFuture(translate, data);

        setCustomDateError(dateValidationErrorKey);
        setCustomTimeError(timeValidationErrorKey);

        return {
            dateError: dateValidationErrorKey,
            timeError: timeValidationErrorKey,
        };
    };

    useEffect(() => {
        if (!data) {
            return;
        }
        validate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const validateCustomDate = () => validate();

    return {customDateError, customTimeError, validateCustomDate};
};

function StatusClearAfterPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const clearAfter = currentUserPersonalDetails.status?.clearAfter ?? '';
    const [customStatus] = useOnyx(ONYXKEYS.CUSTOM_STATUS_DRAFT, {canBeMissing: true});
    const [statusDraftCustomClearAfterDate] = useOnyx(ONYXKEYS.STATUS_DRAFT_CUSTOM_CLEAR_AFTER_DATE, {canBeMissing: true});

    const draftClearAfter = customStatus?.clearAfter ?? '';
    const [draftPeriod, setDraftPeriod] = useState(() => getSelectedStatusType(draftClearAfter || clearAfter));
    const statusType = useMemo<StatusType[]>(
        () =>
            Object.entries(CONST.CUSTOM_STATUS_TYPES).map(([key, value]) => ({
                value,
                text: translate(`statusPage.timePeriods.${value}`),
                keyForList: key,
                isSelected: draftPeriod === value,
            })),
        [draftPeriod, translate],
    );

    const {customDateError, customTimeError} = useValidateCustomDate(translate, draftClearAfter);

    const {redBrickDateIndicator, redBrickTimeIndicator} = useMemo(
        () => ({
            redBrickDateIndicator: customDateError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
            redBrickTimeIndicator: customTimeError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined,
        }),
        [customTimeError, customDateError],
    );

    const updateMode = useCallback(
        (mode: StatusType) => {
            if (mode.value === draftPeriod) {
                return;
            }
            setDraftPeriod(mode.value);

            if (mode.value === CONST.CUSTOM_STATUS_TYPES.CUSTOM) {
                updateStatusDraftCustomClearAfterDate(DateUtils.getOneHourFromNow());
            }
        },
        [draftPeriod],
    );

    useEffect(() => {
        updateStatusDraftCustomClearAfterDate(draftClearAfter || clearAfter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const customStatusDate = DateUtils.extractDate(statusDraftCustomClearAfterDate ?? '');
    const customStatusTime = DateUtils.extractTime12Hour(statusDraftCustomClearAfterDate ?? '');

    const listFooterContent = useMemo(() => {
        if (draftPeriod !== CONST.CUSTOM_STATUS_TYPES.CUSTOM) {
            return;
        }
        return (
            <>
                <MenuItemWithTopDescription
                    title={customStatusDate}
                    description={translate('statusPage.date')}
                    shouldShowRightIcon
                    containerStyle={styles.pr2}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_CLEAR_AFTER_DATE)}
                    errorText={customDateError}
                    titleStyle={styles.flex1}
                    brickRoadIndicator={redBrickDateIndicator}
                />
                <MenuItemWithTopDescription
                    title={customStatusTime}
                    description={translate('statusPage.time')}
                    shouldShowRightIcon
                    containerStyle={styles.pr2}
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_CLEAR_AFTER_TIME)}
                    errorText={customTimeError}
                    titleStyle={styles.flex1}
                    brickRoadIndicator={redBrickTimeIndicator}
                />
            </>
        );
    }, [translate, styles.pr2, styles.flex1, draftPeriod, customStatusDate, customStatusTime, redBrickDateIndicator, redBrickTimeIndicator, customDateError, customTimeError]);

    const saveAndGoBack = useCallback(() => {
        if (!draftPeriod) {
            return;
        }

        let calculatedDraftDate = '';

        if (draftPeriod === CONST.CUSTOM_STATUS_TYPES.CUSTOM) {
            calculatedDraftDate = statusDraftCustomClearAfterDate ?? DateUtils.getOneHourFromNow();
        } else {
            const selectedRange = statusType.find((item) => item.value === draftPeriod);
            calculatedDraftDate = DateUtils.getDateFromStatusType(selectedRange?.value ?? CONST.CUSTOM_STATUS_TYPES.NEVER);
        }

        updateDraftCustomStatus({clearAfter: calculatedDraftDate});

        Navigation.goBack(ROUTES.SETTINGS_STATUS);
    }, [draftPeriod, statusType, statusDraftCustomClearAfterDate]);

    const initialFocusedIndex = useMemo(() => {
        return statusType.find((item) => item.isSelected)?.keyForList;
    }, [statusType]);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('statusPage.save'),
            onConfirm: saveAndGoBack,
        }),
        [saveAndGoBack, translate],
    );

    const timePeriodOptions = useCallback(
        () => (
            <SelectionList
                data={statusType}
                ListItem={RadioListItem}
                onSelectRow={updateMode}
                listFooterContent={listFooterContent}
                confirmButtonOptions={confirmButtonOptions}
                initiallyFocusedItemKey={initialFocusedIndex}
                shouldUpdateFocusedIndex
            />
        ),
        [statusType, updateMode, listFooterContent, confirmButtonOptions, initialFocusedIndex],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="StatusClearAfterPage"
        >
            <HeaderWithBackButton
                title={translate('statusPage.clearAfter')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
            />
            <Text style={[styles.textNormal, styles.mh5, styles.mv4]}>{translate('statusPage.whenClearStatus')}</Text>
            {timePeriodOptions()}
        </ScreenWrapper>
    );
}

export default StatusClearAfterPage;
