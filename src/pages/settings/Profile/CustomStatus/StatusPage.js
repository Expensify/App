import lodashGet from 'lodash/get';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import EmojiPickerButtonDropdown from '@components/EmojiPicker/EmojiPickerButtonDropdown';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderPageLayout from '@components/HeaderPageLayout';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const INPUT_IDS = {
    EMOJI_CODE: 'emojiCode',
    STATUS_TEXT: 'statusText',
};

const propTypes = {
    ...withCurrentUserPersonalDetailsPropTypes,
};

const initialEmoji = '💬';

function StatusPage({draftStatus, currentUserPersonalDetails}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const formRef = useRef(null);
    const [brickRoadIndicator, setBrickRoadIndicator] = useState('');
    const currentUserEmojiCode = lodashGet(currentUserPersonalDetails, 'status.emojiCode', '');
    const currentUserStatusText = lodashGet(currentUserPersonalDetails, 'status.text', '');
    const currentUserClearAfter = lodashGet(currentUserPersonalDetails, 'status.clearAfter', '');
    const draftEmojiCode = lodashGet(draftStatus, 'emojiCode');
    const draftText = lodashGet(draftStatus, 'text');
    const draftClearAfter = lodashGet(draftStatus, 'clearAfter');

    const defaultEmoji = draftEmojiCode || currentUserEmojiCode || initialEmoji;
    const defaultText = draftText || currentUserStatusText;

    const customClearAfter = useMemo(() => {
        const dataToShow = draftClearAfter || currentUserClearAfter;
        return DateUtils.getLocalizedTimePeriodDescription(dataToShow);
    }, [draftClearAfter, currentUserClearAfter]);

    const isValidClearAfterDate = useCallback(() => {
        const clearAfterTime = draftClearAfter || currentUserClearAfter;
        if (clearAfterTime === CONST.CUSTOM_STATUS_TYPES.NEVER || clearAfterTime === '') {
            return true;
        }

        return DateUtils.isTimeAtLeastOneMinuteInFuture({dateTimeString: clearAfterTime});
    }, [draftClearAfter, currentUserClearAfter]);

    const navigateBackToPreviousScreen = useCallback(() => Navigation.goBack(ROUTES.SETTINGS_PROFILE, false, true), []);
    const updateStatus = useCallback(
        ({emojiCode, statusText}) => {
            const clearAfterTime = draftClearAfter || currentUserClearAfter;
            const isValid = DateUtils.isTimeAtLeastOneMinuteInFuture({dateTimeString: clearAfterTime});
            if (!isValid && clearAfterTime !== CONST.CUSTOM_STATUS_TYPES.NEVER) {
                setBrickRoadIndicator(isValidClearAfterDate() ? null : CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
                return;
            }

            User.updateCustomStatus({
                text: statusText,
                emojiCode,
                clearAfter: clearAfterTime !== CONST.CUSTOM_STATUS_TYPES.NEVER ? clearAfterTime : '',
            });

            User.clearDraftCustomStatus();
            InteractionManager.runAfterInteractions(() => {
                navigateBackToPreviousScreen();
            });
        },
        [currentUserClearAfter, draftClearAfter, isValidClearAfterDate, navigateBackToPreviousScreen],
    );

    const clearStatus = () => {
        User.clearCustomStatus();
        User.updateDraftCustomStatus({
            text: '',
            emojiCode: '',
            clearAfter: DateUtils.getEndOfToday(),
        });
        formRef.current.resetForm({[INPUT_IDS.EMOJI_CODE]: initialEmoji});
    };

    useEffect(() => setBrickRoadIndicator(isValidClearAfterDate() ? null : CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR), [isValidClearAfterDate]);

    useEffect(() => {
        if (!currentUserEmojiCode && !currentUserClearAfter && !draftClearAfter) {
            User.updateDraftCustomStatus({clearAfter: DateUtils.getEndOfToday()});
        } else {
            User.updateDraftCustomStatus({clearAfter: currentUserClearAfter});
        }

        return () => User.clearDraftCustomStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validateForm = useCallback(() => {
        if (brickRoadIndicator) {
            return {clearAfter: ''};
        }
        return {};
    }, [brickRoadIndicator]);

    return (
        <ScreenWrapper
            style={[StyleUtils.getBackgroundColorStyle(theme.PAGE_THEMES[SCREENS.SETTINGS.PROFILE.STATUS].backgroundColor)]}
            shouldEnablePickerAvoiding={false}
            includeSafeAreaPaddingBottom={false}
            testID={HeaderPageLayout.displayName}
        >
            <HeaderWithBackButton
                title={translate('statusPage.status')}
                onBackButtonPress={navigateBackToPreviousScreen}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM}
                style={[styles.flexGrow1, styles.flex1]}
                ref={formRef}
                submitButtonText={translate('statusPage.save')}
                submitButtonStyles={[styles.mh5, styles.flexGrow1]}
                onSubmit={updateStatus}
                validate={validateForm}
                enabledWhenOffline
            >
                <View style={[styles.mh5, styles.mv1]}>
                    <Text style={[styles.textNormal, styles.mt2]}>{translate('statusPage.statusExplanation')}</Text>
                </View>
                <View style={[styles.mb2, styles.mt4]}>
                    <View style={[styles.mb4, styles.ph5]}>
                        <InputWrapper
                            InputComponent={EmojiPickerButtonDropdown}
                            inputID={INPUT_IDS.EMOJI_CODE}
                            accessibilityLabel={INPUT_IDS.EMOJI_CODE}
                            role={CONST.ACCESSIBILITY_ROLE.TEXT}
                            defaultValue={defaultEmoji}
                            style={styles.mb3}
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.STATUS_TEXT}
                            role={CONST.ACCESSIBILITY_ROLE.TEXT}
                            label={translate('statusPage.message')}
                            accessibilityLabel={INPUT_IDS.STATUS_TEXT}
                            defaultValue={defaultText}
                            maxLength={CONST.STATUS_TEXT_MAX_LENGTH}
                            autoFocus
                            shouldDelayFocus
                        />
                    </View>
                    <MenuItemWithTopDescription
                        title={customClearAfter}
                        description={translate('statusPage.clearAfter')}
                        shouldShowRightIcon
                        onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_CLEAR_AFTER)}
                        containerStyle={styles.pr2}
                        brickRoadIndicator={brickRoadIndicator}
                    />
                    {(!!currentUserEmojiCode || !!currentUserStatusText) && (
                        <MenuItem
                            title={translate('statusPage.clearStatus')}
                            titleStyle={styles.ml0}
                            icon={Expensicons.Trashcan}
                            onPress={clearStatus}
                            iconFill={theme.danger}
                            wrapperStyle={[styles.pl2]}
                        />
                    )}
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

StatusPage.displayName = 'StatusPage';
StatusPage.propTypes = propTypes;

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        draftStatus: {
            key: () => ONYXKEYS.CUSTOM_STATUS_DRAFT,
        },
    }),
)(StatusPage);
