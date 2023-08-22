import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {View} from 'react-native';
import _ from 'lodash';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Form from '../../../../components/Form';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ROUTES from '../../../../ROUTES';
import Navigation from '../../../../libs/Navigation/Navigation';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import SelectionListRadio from '../../../../components/SelectionListRadio';
import useLocalize from '../../../../hooks/useLocalize';
import ONYXKEYS from '../../../../ONYXKEYS';
import CONST from '../../../../CONST';
import * as User from '../../../../libs/actions/User';
import withLocalize from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import DateUtils from '../../../../libs/DateUtils';
import withCurrentUserPersonalDetails, { withCurrentUserPersonalDetailsDefaultProps } from '../../../../components/withCurrentUserPersonalDetails';
import personalDetailsPropType from '../../../personalDetailsPropType';

const defaultProps = {
  ...withCurrentUserPersonalDetailsDefaultProps,
};

const propTypes = {
  currentUserPersonalDetails: personalDetailsPropType,
};

function StatusClearAfterPage({currentUserPersonalDetails, customStatus}) {
    const localize = useLocalize();
    const clearAfter = lodashGet(currentUserPersonalDetails, 'status.clearAfter', '');

    const draftClearAfter = lodashGet(customStatus, 'clearAfter', '');
    const customDateTemporary = lodashGet(customStatus, 'customDateTemporary', '');
    const [draftPeriod, setDraftPeriod] = useState((clearAfter && !draftClearAfter) || draftClearAfter ? CONST.CUSTOM_STATUS_TYPES.CUSTOM : CONST.CUSTOM_STATUS_TYPES.AFTER_TODAY);

    const localesToThemes = useMemo(
        () =>
            _.map(CONST.CUSTOM_STATUS_TYPES, (value, key) => ({
                value,
                text: localize.translate(`statusPage.timePeriods.${value}`),
                keyForList: key,
                isSelected: draftPeriod === value,
            })),
        [draftPeriod],
    );

    const onSubmit = () => {
        let calculatedDraftDate = '';
        if (draftPeriod === CONST.CUSTOM_STATUS_TYPES.CUSTOM) {
            calculatedDraftDate = customDateTemporary || draftClearAfter;
        } else {
            const selectedRange = localesToThemes.find((item) => item.isSelected);
            calculatedDraftDate = DateUtils.getDateBasedFromType(selectedRange.value);
        }

        User.updateDraftCustomStatus({clearAfter: calculatedDraftDate, customDateTemporary: calculatedDraftDate});
        Navigation.goBack(ROUTES.SETTINGS_STATUS);
    };

    const updateMode = useCallback(
        (mode) => {
            if (mode.value === draftPeriod) return;
            User.updateDraftCustomStatus({
                customDateTemporary: mode.value === CONST.CUSTOM_STATUS_TYPES.CUSTOM ? DateUtils.getOneHourFromNow() : DateUtils.getDateBasedFromType(mode.value),
            });
            setDraftPeriod(mode.value);
        },
        [draftPeriod],
    );

    useEffect(() => {
        User.updateDraftCustomStatus({
            customDateTemporary: clearAfter,
            clearAfter,
        });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const customStatusDate = DateUtils.extractDate(customDateTemporary || draftClearAfter || clearAfter);
    const customStatusTime = DateUtils.extractTime12Hour(customDateTemporary || clearAfter);

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title="Status"
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
            />
            <Text style={[styles.textNormal, styles.mh5, styles.mv4]}>When should we clear your status?</Text>
            <Form
                formID={ONYXKEYS.FORMS.SETTINGS_STATUS_SET_CLEAR_AFTER_FORM}
                onCloseButtonPress={() => {}}
                onBackButtonPress={() => {}}
                submitButtonText="Save"
                onSubmit={onSubmit}
                style={[{flexGrow: 1}]}
                scrollContextEnabled={false}
            >
                <View style={{flexGrow: 1}}>
                    <SelectionListRadio
                        sections={[{data: localesToThemes, indexOffset: 0}]}
                        onSelectRow={updateMode}
                        disableInitialFocusOptionStyle
                        wrapperStyle={{flex: null}}
                    />

                    {draftPeriod === CONST.CUSTOM_STATUS_TYPES.CUSTOM && (
                        <>
                            <MenuItemWithTopDescription
                                title={customStatusDate}
                                description="Clear after"
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_CLEAR_AFTER_CUSTOM)}
                            />
                            <MenuItemWithTopDescription
                                title={customStatusTime}
                                description="Clear after"
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_CLEAR_AFTER_TIME)}
                            />
                        </>
                    )}
                </View>
            </Form>
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
