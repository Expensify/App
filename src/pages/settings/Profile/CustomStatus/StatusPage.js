import React, {useMemo, useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../../../../components/withCurrentUserPersonalDetails';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import HeaderPageLayout from '../../../../components/HeaderPageLayout';
import * as Expensicons from '../../../../components/Icon/Expensicons';
import withLocalize from '../../../../components/withLocalize';
import MenuItem from '../../../../components/MenuItem';
import Button from '../../../../components/Button';
import Text from '../../../../components/Text';
import Navigation from '../../../../libs/Navigation/Navigation';
import * as User from '../../../../libs/actions/User';
import MobileBackgroundImage from '../../../../../assets/images/money-stack.svg';
import themeColors from '../../../../styles/themes/default';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import DateUtils from '../../../../libs/DateUtils';
import compose from '../../../../libs/compose';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import CONST from '../../../../CONST';
import SCREENS from '../../../../SCREENS';

const propTypes = {
    ...withCurrentUserPersonalDetailsPropTypes,
};

function StatusPage({draftStatus, currentUserPersonalDetails}) {
    const localize = useLocalize();
    const [brickRoadIndicator, setBrickRoadIndicator] = useState('');
    const currentUserEmojiCode = lodashGet(currentUserPersonalDetails, 'status.emojiCode', '');
    const currentUserStatusText = lodashGet(currentUserPersonalDetails, 'status.text', '');
    const currentUserClearAfter = lodashGet(currentUserPersonalDetails, 'status.clearAfter', '');
    const draftEmojiCode = lodashGet(draftStatus, 'emojiCode');
    const draftText = lodashGet(draftStatus, 'text');
    const draftClearAfter = lodashGet(draftStatus, 'clearAfter');

    const defaultEmoji = draftEmojiCode || currentUserEmojiCode;
    const defaultText = draftEmojiCode ? draftText : currentUserStatusText;
    const areAllValuesEmpty = !draftEmojiCode && !draftText && !currentUserEmojiCode && !currentUserStatusText;
    const statusEmojiWithMessage = draftEmojiCode ? `${draftEmojiCode} ${draftText}` : `${currentUserEmojiCode || ''} ${currentUserStatusText || ''}`;
    const customStatus = areAllValuesEmpty ? '' : statusEmojiWithMessage;
    const hasDraftStatus =
        !!draftEmojiCode || !!draftText || ((!!draftEmojiCode || !!currentUserEmojiCode) && !!draftClearAfter && !DateUtils.areDatesIdentical(draftClearAfter, currentUserClearAfter));
    const customClearAfter = useMemo(() => {
        const dataToShow = draftClearAfter || currentUserClearAfter;
        return DateUtils.getLocalizedTimePeriodDescription(dataToShow);
    }, [draftClearAfter, currentUserClearAfter]);

    const isValidClearAfterDate = useCallback(() => {
        const clearAfterTime = draftClearAfter || currentUserClearAfter;
        if (clearAfterTime === CONST.CUSTOM_STATUS_TYPES.NEVER) {
            return true;
        }

        return !DateUtils.hasDateExpired(clearAfterTime);
    }, [draftClearAfter, currentUserClearAfter]);

    const navigateBackToSettingsPage = useCallback(() => Navigation.goBack(ROUTES.SETTINGS_PROFILE, false, true), []);
    const updateStatus = useCallback(() => {
        const clearAfterTime = draftClearAfter || currentUserClearAfter;
        if (DateUtils.hasDateExpired(clearAfterTime)) {
            setBrickRoadIndicator(isValidClearAfterDate() ? null : CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR);
            return;
        }

        User.updateCustomStatus({
            text: defaultText,
            emojiCode: defaultEmoji,
            clearAfter: clearAfterTime !== CONST.CUSTOM_STATUS_TYPES.NEVER ? clearAfterTime : '',
        });

        User.clearDraftCustomStatus();
        Navigation.goBack(ROUTES.SETTINGS_PROFILE);
    }, [defaultText, defaultEmoji, currentUserClearAfter, draftClearAfter, isValidClearAfterDate]);

    const clearStatus = () => {
        User.clearCustomStatus();
        User.updateDraftCustomStatus({
            text: '',
            emojiCode: '',
            clearAfter: DateUtils.getEndOfToday(),
            customDateTemporary: '',
        });
    };

    const footerComponent = useMemo(
        () =>
            hasDraftStatus && isValidClearAfterDate() ? (
                <Button
                    success
                    text={localize.translate('statusPage.save')}
                    onPress={updateStatus}
                />
            ) : null,
        [hasDraftStatus, localize, updateStatus, isValidClearAfterDate],
    );

    useEffect(() => setBrickRoadIndicator(isValidClearAfterDate() ? null : CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR), [isValidClearAfterDate]);
    useEffect(() => {
        if (!currentUserEmojiCode && !currentUserClearAfter && !draftClearAfter) {
            User.updateDraftCustomStatus({clearAfter: DateUtils.getEndOfToday()});
        }

        return () => User.clearDraftCustomStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <HeaderPageLayout
            title={localize.translate('statusPage.status')}
            onBackButtonPress={navigateBackToSettingsPage}
            headerContent={
                <MobileBackgroundImage
                    pointerEvents="none"
                    style={styles.staticHeaderImage}
                />
            }
            headerContainerStyles={[styles.staticHeaderImage]}
            backgroundColor={themeColors.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.STATUS]}
            footer={footerComponent}
        >
            <View style={styles.m5}>
                <Text style={[styles.textHeadline]}>{localize.translate('statusPage.setStatusTitle')}</Text>
                <Text style={[styles.textNormal, styles.mt2]}>{localize.translate('statusPage.statusExplanation')}</Text>
            </View>
            <MenuItemWithTopDescription
                title={customStatus}
                description={localize.translate('statusPage.status')}
                shouldShowRightIcon
                containerStyle={styles.pr2}
                inputID="test"
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_SET)}
            />
            <MenuItemWithTopDescription
                title={customClearAfter}
                description={localize.translate('statusPage.clearAfter')}
                shouldShowRightIcon
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_CLEAR_AFTER)}
                containerStyle={styles.pr2}
                brickRoadIndicator={brickRoadIndicator}
            />

            {(!!currentUserEmojiCode || !!currentUserStatusText) && (
                <MenuItem
                    title={localize.translate('statusPage.clearStatus')}
                    icon={Expensicons.Close}
                    onPress={clearStatus}
                    iconFill={themeColors.danger}
                    wrapperStyle={[styles.cardMenuItem]}
                />
            )}
        </HeaderPageLayout>
    );
}

StatusPage.displayName = 'StatusPage';
StatusPage.propTypes = propTypes;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withOnyx({
        draftStatus: {
            key: () => ONYXKEYS.CUSTOM_STATUS_DRAFT,
        },
    }),
)(StatusPage);
