import _ from 'lodash';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import BaseListItem from '@components/SelectionList/BaseListItem';
import Text from '@components/Text';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps} from '@components/withCurrentUserPersonalDetails';
import withLocalize from '@components/withLocalize';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@libs/actions/User';
import compose from '@libs/compose';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import personalDetailsPropType from '@pages/personalDetailsPropType';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

const propTypes = {
    currentUserPersonalDetails: personalDetailsPropType,
    customStatus: PropTypes.shape({
        clearAfter: PropTypes.string,
    }),
};

/**
 * @param {string} data -  either a value from CONST.CUSTOM_STATUS_TYPES or a dateTime string in the format YYYY-MM-DD HH:mm
 * @returns {string}
 */
function getSelectedStatusType(data) {
    switch (data) {
        case DateUtils.getEndOfToday():
            return CONST.CUSTOM_STATUS_TYPES.AFTER_TODAY;
        case CONST.CUSTOM_STATUS_TYPES.NEVER:
        case '':
            return CONST.CUSTOM_STATUS_TYPES.NEVER;
        case false:
            return CONST.CUSTOM_STATUS_TYPES.AFTER_TODAY;
        default:
            return CONST.CUSTOM_STATUS_TYPES.CUSTOM;
    }
}

const useValidateCustomDate = (data) => {
    const {translate} = useLocalize();
    const [customDateError, setCustomDateError] = useState('');
    const [customTimeError, setCustomTimeError] = useState('');
    const validate = () => {
        const {dateValidationErrorKey, timeValidationErrorKey} = ValidationUtils.validateDateTimeIsAtLeastOneMinuteInFuture(data);

        const dateError = dateValidationErrorKey ? translate(dateValidationErrorKey) : '';
        setCustomDateError(dateError);

        const timeError = timeValidationErrorKey ? translate(timeValidationErrorKey) : '';
        setCustomTimeError(timeError);

        return {
            dateError,
            timeError,
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

function StatusClearAfterPage({currentUserPersonalDetails, customStatus}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const clearAfter = lodashGet(currentUserPersonalDetails, 'status.clearAfter', '');
    const draftClearAfter = lodashGet(customStatus, 'clearAfter', '');
    const [draftPeriod, setDraftPeriod] = useState(getSelectedStatusType(draftClearAfter || clearAfter));
    const statusType = useMemo(
        () =>
            _.map(CONST.CUSTOM_STATUS_TYPES, (value, key) => ({
                value,
                text: translate(`statusPage.timePeriods.${value}`),
                keyForList: key,
                isSelected: draftPeriod === value,
            })),
        [draftPeriod, translate],
    );

    const {customDateError, customTimeError, validateCustomDate} = useValidateCustomDate(draftClearAfter);

    const {redBrickDateIndicator, redBrickTimeIndicator} = useMemo(
        () => ({
            redBrickDateIndicator: customDateError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : null,
            redBrickTimeIndicator: customTimeError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : null,
        }),
        [customTimeError, customDateError],
    );

    const onSubmit = () => {
        const {dateError, timeError} = validateCustomDate();
        if (dateError || timeError) {
            return;
        }
        let calculatedDraftDate = '';
        if (draftPeriod === CONST.CUSTOM_STATUS_TYPES.CUSTOM) {
            calculatedDraftDate = draftClearAfter;
        } else {
            const selectedRange = _.find(statusType, (item) => item.isSelected);
            calculatedDraftDate = DateUtils.getDateFromStatusType(selectedRange.value);
        }
        User.updateDraftCustomStatus({clearAfter: calculatedDraftDate});
        Navigation.goBack(ROUTES.SETTINGS_STATUS);
    };

    const updateMode = useCallback(
        (mode) => {
            if (mode.value === draftPeriod) {
                return;
            }
            setDraftPeriod(mode.value);

            if (mode.value === CONST.CUSTOM_STATUS_TYPES.CUSTOM) {
                User.updateDraftCustomStatus({clearAfter: DateUtils.getOneHourFromNow()});
            } else {
                const selectedRange = _.find(statusType, (item) => item.value === mode.value);
                const calculatedDraftDate = DateUtils.getDateFromStatusType(selectedRange.value);
                User.updateDraftCustomStatus({clearAfter: calculatedDraftDate});
                Navigation.goBack(ROUTES.SETTINGS_STATUS);
            }
        },
        [draftPeriod, statusType],
    );

    useEffect(() => {
        User.updateDraftCustomStatus({
            clearAfter: draftClearAfter || clearAfter,
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const customStatusDate = DateUtils.extractDate(draftClearAfter);
    const customStatusTime = DateUtils.extractTime12Hour(draftClearAfter);

    const timePeriodOptions = useCallback(
        () =>
            _.map(statusType, (item, index) => (
                <BaseListItem
                    item={item}
                    key={`${index}+${item.value}`}
                    onSelectRow={() => updateMode(item)}
                    showTooltip={false}
                />
            )),
        [statusType, updateMode],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={StatusClearAfterPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('statusPage.clearAfter')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
            />
            <Text style={[styles.textNormal, styles.mh5, styles.mv4]}>{translate('statusPage.whenClearStatus')}</Text>
            <FormProvider
                formID={ONYXKEYS.FORMS.SETTINGS_STATUS_SET_CLEAR_AFTER_FORM}
                submitButtonText={translate('statusPage.save')}
                onSubmit={onSubmit}
                style={[styles.flexGrow1, styles.mb4]}
                scrollContextEnabled={false}
                isSubmitButtonVisible={false}
                enabledWhenOffline
            >
                <View>
                    {timePeriodOptions()}
                    {draftPeriod === CONST.CUSTOM_STATUS_TYPES.CUSTOM && (
                        <>
                            <MenuItemWithTopDescription
                                title={customStatusDate}
                                description={translate('statusPage.date')}
                                shouldShowRightIcon
                                containerStyle={styles.pr2}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_CLEAR_AFTER_DATE)}
                                errorText={customDateError}
                                titleTextStyle={styles.flex1}
                                brickRoadIndicator={redBrickDateIndicator}
                            />
                            <MenuItemWithTopDescription
                                title={customStatusTime}
                                description={translate('statusPage.time')}
                                shouldShowRightIcon
                                containerStyle={styles.pr2}
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_CLEAR_AFTER_TIME)}
                                errorText={customTimeError}
                                titleTextStyle={styles.flex1}
                                brickRoadIndicator={redBrickTimeIndicator}
                            />
                        </>
                    )}
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

StatusClearAfterPage.displayName = 'StatusClearAfterPage';
StatusClearAfterPage.propTypes = propTypes;
StatusClearAfterPage.defaultProps = defaultProps;

export default compose(
    withCurrentUserPersonalDetails,
    withLocalize,
    withOnyx({
        timePeriodType: {
            key: `${ONYXKEYS.FORMS.SETTINGS_STATUS_SET_CLEAR_AFTER_FORM}Draft`,
        },
        clearDateForm: {
            key: `${ONYXKEYS.FORMS.SETTINGS_STATUS_CLEAR_DATE_FORM}Draft`,
        },
        customStatus: {
            key: ONYXKEYS.CUSTOM_STATUS_DRAFT,
        },
        preferredLocale: {
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
        },
    }),
)(StatusClearAfterPage);
