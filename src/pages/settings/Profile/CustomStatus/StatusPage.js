import lodashGet from 'lodash/get';
import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import MobileBackgroundImage from '@assets/images/money-stack.svg';
import Button from '@components/Button';
import HeaderPageLayout from '@components/HeaderPageLayout';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useTheme from '@styles/themes/useTheme';
import useThemeStyles from '@styles/useThemeStyles';
import * as User from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const propTypes = {
    ...withCurrentUserPersonalDetailsPropTypes,
};

function StatusPage({draftStatus, currentUserPersonalDetails}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserEmojiCode = lodashGet(currentUserPersonalDetails, 'status.emojiCode', '');
    const currentUserStatusText = lodashGet(currentUserPersonalDetails, 'status.text', '');
    const draftEmojiCode = lodashGet(draftStatus, 'emojiCode');
    const draftText = lodashGet(draftStatus, 'text');

    const defaultEmoji = draftEmojiCode || currentUserEmojiCode;
    const defaultText = draftEmojiCode ? draftText : currentUserStatusText;
    const hasDraftStatus = !!draftEmojiCode || !!draftText;
    const customStatus = useMemo(() => {
        if (draftEmojiCode) {
            return `${draftEmojiCode} ${draftText}`;
        }
        if (currentUserEmojiCode || currentUserStatusText) {
            return `${currentUserEmojiCode || ''} ${currentUserStatusText || ''}`;
        }
        return '';
    }, [draftEmojiCode, draftText, currentUserEmojiCode, currentUserStatusText]);

    const clearStatus = () => {
        User.clearCustomStatus();
        User.clearDraftCustomStatus();
    };

    const navigateBackToSettingsPage = useCallback(() => {
        const topMostReportID = Navigation.getTopmostReportId();
        if (topMostReportID) {
            Navigation.goBack(ROUTES.REPORT_WITH_ID.getRoute(topMostReportID));
        } else {
            Navigation.goBack(ROUTES.SETTINGS_PROFILE, false, true);
        }
    }, []);

    const updateStatus = useCallback(() => {
        User.updateCustomStatus({text: defaultText, emojiCode: defaultEmoji});

        User.clearDraftCustomStatus();
        Navigation.goBack(ROUTES.SETTINGS_PROFILE);
    }, [defaultText, defaultEmoji]);
    const footerComponent = useMemo(
        () =>
            hasDraftStatus ? (
                <Button
                    success
                    text={translate('statusPage.save')}
                    onPress={updateStatus}
                />
            ) : null,
        [hasDraftStatus, translate, updateStatus],
    );

    useEffect(() => () => User.clearDraftCustomStatus(), []);

    return (
        <HeaderPageLayout
            title={translate('statusPage.status')}
            onBackButtonPress={navigateBackToSettingsPage}
            headerContent={
                <MobileBackgroundImage
                    pointerEvents="none"
                    style={styles.staticHeaderImage}
                />
            }
            headerContainerStyles={[styles.staticHeaderImage]}
            backgroundColor={theme.PAGE_BACKGROUND_COLORS[SCREENS.SETTINGS.STATUS]}
            footer={footerComponent}
        >
            <View style={[styles.mh5, styles.mb5]}>
                <Text style={[styles.textHeadline]}>{translate('statusPage.setStatusTitle')}</Text>
                <Text style={[styles.textNormal, styles.mt2]}>{translate('statusPage.statusExplanation')}</Text>
            </View>
            <MenuItemWithTopDescription
                title={customStatus}
                description={translate('statusPage.status')}
                shouldShowRightIcon
                inputID="test"
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_SET)}
            />

            {(!!currentUserEmojiCode || !!currentUserStatusText) && (
                <MenuItem
                    title={translate('statusPage.clearStatus')}
                    titleStyle={styles.ml0}
                    icon={Expensicons.Close}
                    onPress={clearStatus}
                    iconFill={theme.danger}
                    wrapperStyle={[styles.pl2]}
                />
            )}
        </HeaderPageLayout>
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
