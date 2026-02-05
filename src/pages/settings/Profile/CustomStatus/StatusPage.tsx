import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {ValueOf} from 'type-fest';
import EmojiPickerButtonDropdown from '@components/EmojiPicker/EmojiPickerButtonDropdown';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues, FormRef} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileChrome} from '@libs/Browser';
import DateUtils from '@libs/DateUtils';
import focusAfterModalClose from '@libs/focusAfterModalClose';
import focusComposerWithDelay from '@libs/focusComposerWithDelay';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Navigation from '@libs/Navigation/Navigation';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {clearCustomStatus, clearDraftCustomStatus, updateCustomStatus, updateDraftCustomStatus} from '@userActions/User';
import {clearVacationDelegateError} from '@userActions/VacationDelegate';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/SettingsStatusSetForm';

const initialEmoji = '💬';

function StatusPage() {
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan', 'FallbackAvatar'] as const);
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    // We intentionally use isSmallScreenWidth here. Since the Status page is displayed
    // inside the RHP, shouldUseNarrowLayout is always true. However, we still need to
    // distinguish between large and small screens, so we rely on isSmallScreenWidth
    // to accurately detect the screen size.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [draftStatus] = useOnyx(ONYXKEYS.CUSTOM_STATUS_DRAFT, {canBeMissing: true});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const formRef = useRef<FormRef>(null);
    const [brickRoadIndicator, setBrickRoadIndicator] = useState<ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS>>();

    const [vacationDelegate] = useOnyx(ONYXKEYS.NVP_PRIVATE_VACATION_DELEGATE, {canBeMissing: true});
    const hasVacationDelegate = !!vacationDelegate?.delegate;
    const vacationDelegatePersonalDetails = getPersonalDetailByEmail(vacationDelegate?.delegate ?? '');
    const formattedDelegateLogin = formatPhoneNumber(vacationDelegatePersonalDetails?.login ?? '');

    const currentUserEmojiCode = currentUserPersonalDetails?.status?.emojiCode ?? '';
    const currentUserStatusText = currentUserPersonalDetails?.status?.text ?? '';
    const currentUserClearAfter = currentUserPersonalDetails?.status?.clearAfter ?? '';
    const draftEmojiCode = draftStatus?.emojiCode;
    const draftText = draftStatus?.text;
    const draftClearAfter = draftStatus?.clearAfter;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const defaultEmoji = draftEmojiCode || currentUserEmojiCode;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const defaultText = draftText || currentUserStatusText;

    const customClearAfter = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const dataToShow = draftClearAfter || currentUserClearAfter;
        return DateUtils.getLocalizedTimePeriodDescription(translate, dataToShow);
    }, [draftClearAfter, currentUserClearAfter, translate]);

    const isValidClearAfterDate = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        const clearAfterTime = draftClearAfter || currentUserClearAfter;
        if (clearAfterTime === CONST.CUSTOM_STATUS_TYPES.NEVER || clearAfterTime === '') {
            return true;
        }

        return DateUtils.isTimeAtLeastOneMinuteInFuture({dateTimeString: clearAfterTime});
    }, [draftClearAfter, currentUserClearAfter]);

    const navigateBackToPreviousScreenTask = useRef<{
        then: (
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            onfulfilled?: () => typeof InteractionManager.runAfterInteractions,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            onrejected?: () => typeof InteractionManager.runAfterInteractions,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
        ) => Promise<typeof InteractionManager.runAfterInteractions>;
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        done: (...args: Array<typeof InteractionManager.runAfterInteractions>) => typeof InteractionManager.runAfterInteractions;
        cancel: () => void;
    } | null>(null);

    useEffect(
        () => () => {
            if (!navigateBackToPreviousScreenTask.current) {
                return;
            }

            navigateBackToPreviousScreenTask.current.cancel();
        },
        [],
    );

    const navigateBackToPreviousScreen = useCallback(() => Navigation.goBack(), []);
    const updateStatus = useCallback(
        ({emojiCode, statusText}: FormOnyxValues<typeof ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM>) => {
            if (navigateBackToPreviousScreenTask.current) {
                return;
            }
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            const clearAfterTime = draftClearAfter || currentUserClearAfter || CONST.CUSTOM_STATUS_TYPES.NEVER;
            const isValid = DateUtils.isTimeAtLeastOneMinuteInFuture({dateTimeString: clearAfterTime});
            if (!isValid && clearAfterTime !== CONST.CUSTOM_STATUS_TYPES.NEVER) {
                setBrickRoadIndicator(isValidClearAfterDate() ? undefined : CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
                return;
            }
            updateCustomStatus({
                text: statusText,
                emojiCode: !emojiCode && statusText ? initialEmoji : emojiCode,
                clearAfter: clearAfterTime !== CONST.CUSTOM_STATUS_TYPES.NEVER ? clearAfterTime : '',
            });
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            navigateBackToPreviousScreenTask.current = InteractionManager.runAfterInteractions(() => {
                clearDraftCustomStatus();
                navigateBackToPreviousScreen();
            });
        },
        [currentUserClearAfter, draftClearAfter, isValidClearAfterDate, navigateBackToPreviousScreen],
    );

    const clearStatus = () => {
        if (navigateBackToPreviousScreenTask.current) {
            return;
        }
        clearCustomStatus();
        updateDraftCustomStatus({
            text: '',
            emojiCode: '',
            clearAfter: DateUtils.getEndOfToday(),
        });
        formRef.current?.resetForm({[INPUT_IDS.EMOJI_CODE]: ''});

        // eslint-disable-next-line @typescript-eslint/no-deprecated
        navigateBackToPreviousScreenTask.current = InteractionManager.runAfterInteractions(() => {
            navigateBackToPreviousScreen();
        });
    };

    useEffect(() => setBrickRoadIndicator(isValidClearAfterDate() ? undefined : CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR), [isValidClearAfterDate]);

    useEffect(() => {
        if (!currentUserEmojiCode && !currentUserClearAfter && !draftClearAfter) {
            updateDraftCustomStatus({clearAfter: DateUtils.getEndOfToday()});
        } else {
            updateDraftCustomStatus({clearAfter: currentUserClearAfter});
        }

        return () => clearDraftCustomStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const validateForm = useCallback(
        ({statusText}: FormOnyxValues<typeof ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM> => {
            if (brickRoadIndicator) {
                return {clearAfter: ''};
            }
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM> = {};
            if (statusText.length > CONST.STATUS_TEXT_MAX_LENGTH) {
                errors[INPUT_IDS.STATUS_TEXT] = translate('common.error.characterLimitExceedCounter', statusText.length, CONST.STATUS_TEXT_MAX_LENGTH);
            }
            return errors;
        },
        [brickRoadIndicator, translate],
    );

    const {inputCallbackRef, inputRef} = useAutoFocusInput();
    const fallbackVacationDelegateLogin = formattedDelegateLogin === '' ? vacationDelegate?.delegate : formattedDelegateLogin;

    return (
        <ScreenWrapper
            style={[StyleUtils.getBackgroundColorStyle(theme.PAGE_THEMES[SCREENS.SETTINGS.PROFILE.STATUS].backgroundColor)]}
            shouldEnablePickerAvoiding={false}
            includeSafeAreaPaddingBottom
            testID="HeaderPageLayout"
            shouldEnableMaxHeight
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
                shouldScrollToEnd
            >
                <View style={[styles.mh5, styles.mv1]}>
                    <Text style={[styles.textNormal, styles.mt2]}>{translate('statusPage.statusExplanation')}</Text>
                </View>
                <View style={[styles.mt4]}>
                    <View style={[styles.mb4, styles.ph5]}>
                        <InputWrapper
                            InputComponent={EmojiPickerButtonDropdown}
                            inputID={INPUT_IDS.EMOJI_CODE}
                            accessibilityLabel={INPUT_IDS.EMOJI_CODE}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={defaultEmoji}
                            style={styles.mb3}
                            onModalHide={() => {
                                // On mobile Chrome, the input will blur immediately upon focus if the focus function is called right after the modal closes, even though the modal has fully closed.
                                // Therefore, use the `focusComposerWithDelay` helper as used in `ComposerWithSuggestions` for this case.
                                if (isMobileChrome()) {
                                    focusComposerWithDelay(inputRef.current)(true);
                                } else {
                                    focusAfterModalClose(inputRef.current);
                                }
                            }}
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            onInputChange={(emoji: string): void => {}}
                        />
                        <InputWrapper
                            InputComponent={TextInput}
                            ref={isSmallScreenWidth ? undefined : inputCallbackRef}
                            inputID={INPUT_IDS.STATUS_TEXT}
                            role={CONST.ROLE.PRESENTATION}
                            label={translate('statusPage.message')}
                            accessibilityLabel={INPUT_IDS.STATUS_TEXT}
                            defaultValue={defaultText}
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
                            icon={icons.Trashcan}
                            onPress={clearStatus}
                        />
                    )}
                </View>
                <View style={[styles.mb2, styles.mt6]}>
                    <Text style={[styles.mh5]}>{translate('statusPage.setVacationDelegate')}</Text>
                    {hasVacationDelegate && <Text style={[styles.mh5, styles.mt6, styles.mutedTextLabel]}>{translate('statusPage.vacationDelegate')}</Text>}
                    {hasVacationDelegate ? (
                        <OfflineWithFeedback
                            pendingAction={vacationDelegate?.pendingAction}
                            errors={vacationDelegate?.errors}
                            errorRowStyles={styles.mh5}
                            onClose={() => clearVacationDelegateError(vacationDelegate?.previousDelegate)}
                        >
                            <MenuItem
                                title={vacationDelegatePersonalDetails?.displayName ?? fallbackVacationDelegateLogin}
                                description={fallbackVacationDelegateLogin}
                                avatarID={vacationDelegatePersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID}
                                icon={vacationDelegatePersonalDetails?.avatar ?? icons.FallbackAvatar}
                                iconType={CONST.ICON_TYPE_AVATAR}
                                numberOfLinesDescription={1}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_VACATION_DELEGATE)}
                                containerStyle={styles.pr2}
                            />
                        </OfflineWithFeedback>
                    ) : (
                        <View style={[styles.mt1]}>
                            <MenuItem
                                description={translate('statusPage.vacationDelegate')}
                                shouldShowRightIcon
                                onPress={() => Navigation.navigate(ROUTES.SETTINGS_VACATION_DELEGATE)}
                                containerStyle={styles.pr2}
                            />
                        </View>
                    )}
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

export default StatusPage;
