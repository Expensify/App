import React, {useMemo, useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../../../../components/withCurrentUserPersonalDetails';
import MenuItemWithTopDescription from '../../../../components/MenuItemWithTopDescription';
import StaticHeaderPageLayout from '../../../../components/StaticHeaderPageLayout';
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

const propTypes = {
    ...withCurrentUserPersonalDetailsPropTypes,
};

function StatusPage({draftStatus, currentUserPersonalDetails}) {
    const localize = useLocalize();
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

    const navigateBackToSettingsPage = useCallback(() => Navigation.goBack(ROUTES.SETTINGS_PROFILE, false, true), []);
    const updateStatus = useCallback(() => {
        const clearAfterTime = draftClearAfter || currentUserClearAfter;
        if (DateUtils.hasDateExpired(clearAfterTime)) return;
        User.updateCustomStatus({
            text: defaultText,
            emojiCode: defaultEmoji,
            clearAfter: clearAfterTime !== CONST.CUSTOM_STATUS_TYPES.NEVER ? clearAfterTime : '',
        });

        User.clearDraftCustomStatus();
        Navigation.goBack(ROUTES.SETTINGS_PROFILE);
    }, [defaultText, defaultEmoji, currentUserClearAfter, draftClearAfter, isValidClearAfterDate]);

    useEffect(() => {
        if (currentUserEmojiCode || currentUserClearAfter || draftClearAfter) return;
        User.updateDraftCustomStatus({clearAfter: DateUtils.getEndOfToday()});

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            hasDraftStatus ? (
                <Button
                    success
                    text={localize.translate('statusPage.save')}
                    onPress={updateStatus}
                    innerStyles={[styles.mb6]}
                />
            ) : null,
        [hasDraftStatus, localize, updateStatus, isValidClearAfterDate],
    );

    const isValidClearAfterDate = useMemo(() => {
        const clearAfterTime = draftClearAfter || currentUserClearAfter;
        if (clearAfterTime === CONST.CUSTOM_STATUS_TYPES.NEVER) return true;

        return !DateUtils.hasDateExpired(clearAfterTime);
    }, [draftClearAfter, currentUserClearAfter]);

    const brickRoadIndicator = useMemo(() => (isValidClearAfterDate ? null : CONST.BRICK_INDICATOR.ERROR), [isValidClearAfterDate]);
    useEffect(() => () => User.clearDraftCustomStatus(), []);

    return (
        <StaticHeaderPageLayout
            title={localize.translate('statusPage.status')}
            onBackButtonPress={navigateBackToSettingsPage}
            backgroundColor={themeColors.midtone}
            image={MobileBackgroundImage}
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
        </StaticHeaderPageLayout>
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
