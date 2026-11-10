import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import MenuItem from '@components/MenuItem';
import type {MenuItemRootProps} from '@components/MenuItem/layout/MenuItemRoot';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import {validateDateTimeIsAtLeastOneMinuteInFuture} from '@libs/ValidationUtils';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';
import {updateDraftCustomStatus, updateStatusDraftCustomClearAfterDate} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useEffect, useState} from 'react';

type CustomStatusTypes = ValueOf<typeof CONST.CUSTOM_STATUS_TYPES>;

type StatusType = {
    value: CustomStatusTypes;
    text: string;
    keyForList: string;
    isSelected: boolean;
};

type StatusExpiryFieldProps = Pick<MenuItemRootProps, 'onPress' | 'sentryLabel'> & {
    name: string;
    value: string;
    error: string;
};

function StatusExpiryField({name, value, error, onPress, sentryLabel}: StatusExpiryFieldProps) {
    return (
        <MenuItem.Root
            onPress={onPress}
            sentryLabel={sentryLabel}
            accessibilityLabel={[name, value].filter(Boolean).join(', ')}
        >
            <MenuItemField.Row
                name={name}
                value={value}
            >
                {!!error && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                <MenuItem.Chevron />
            </MenuItemField.Row>
            {!!error && (
                <MenuItem.HelpText
                    isError
                    message={error}
                />
            )}
        </MenuItem.Root>
    );
}

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
    const {translate, dateFnsLocale} = useLocalize();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const clearAfter = currentUserPersonalDetails.status?.clearAfter ?? '';
    const [customStatus] = useOnyx(ONYXKEYS.CUSTOM_STATUS_DRAFT);
    const [statusDraftCustomClearAfterDate] = useOnyx(ONYXKEYS.STATUS_DRAFT_CUSTOM_CLEAR_AFTER_DATE);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});

    const draftClearAfter = customStatus?.clearAfter ?? '';
    const [draftPeriod, setDraftPeriod] = useState(() => getSelectedStatusType(draftClearAfter || clearAfter));
    const statusType: StatusType[] = Object.entries(CONST.CUSTOM_STATUS_TYPES).map(([key, value]) => ({
        value,
        text: translate(`statusPage.timePeriods.${value}`),
        keyForList: key,
        isSelected: draftPeriod === value,
    }));

    const {customDateError, customTimeError} = useValidateCustomDate(translate, draftClearAfter);

    const updateMode = (mode: StatusType) => {
        if (mode.value === draftPeriod) {
            return;
        }
        setDraftPeriod(mode.value);

        if (mode.value === CONST.CUSTOM_STATUS_TYPES.CUSTOM) {
            updateStatusDraftCustomClearAfterDate(DateUtils.getOneHourFromNow());
        }
    };

    useEffect(() => {
        updateStatusDraftCustomClearAfterDate(draftClearAfter || clearAfter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const customStatusDate = DateUtils.extractDate(statusDraftCustomClearAfterDate ?? '');
    // The Never and empty cases are guarded here because, unlike `extractTime12Hour`, the display formatter parses
    // whatever it is handed.
    const customStatusTime =
        statusDraftCustomClearAfterDate && statusDraftCustomClearAfterDate !== CONST.CUSTOM_STATUS_TYPES.NEVER
            ? DateUtils.formatToLocalTime(statusDraftCustomClearAfterDate, dateFnsLocale)
            : '';

    const listFooterContent =
        draftPeriod !== CONST.CUSTOM_STATUS_TYPES.CUSTOM ? undefined : (
            <>
                <StatusExpiryField
                    name={translate('statusPage.date')}
                    value={customStatusDate}
                    error={customDateError}
                    onPress={callFunctionIfActionIsAllowed(() => Navigation.navigate(ROUTES.SETTINGS_STATUS_CLEAR_AFTER_DATE), false, session)}
                    sentryLabel={CONST.SENTRY_LABEL.CUSTOM_STATUS.CLEAR_AFTER_DATE}
                />
                <StatusExpiryField
                    name={translate('statusPage.time')}
                    value={customStatusTime}
                    error={customTimeError}
                    onPress={callFunctionIfActionIsAllowed(() => Navigation.navigate(ROUTES.SETTINGS_STATUS_CLEAR_AFTER_TIME), false, session)}
                    sentryLabel={CONST.SENTRY_LABEL.CUSTOM_STATUS.CLEAR_AFTER_TIME}
                />
            </>
        );

    const saveAndGoBack = () => {
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
    };

    const initialFocusedIndex = statusType.find((item) => item.isSelected)?.keyForList;

    const confirmButtonOptions = {
        showButton: true,
        text: translate('statusPage.save'),
        onConfirm: saveAndGoBack,
    };

    const timePeriodOptions = () => (
        <SelectionList
            data={statusType}
            ListItem={SingleSelectListItem}
            onSelectRow={updateMode}
            listFooterContent={listFooterContent}
            confirmButtonOptions={confirmButtonOptions}
            initiallyFocusedItemKey={initialFocusedIndex}
            shouldUpdateFocusedIndex
        />
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
