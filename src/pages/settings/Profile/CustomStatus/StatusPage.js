import React, {useMemo, useCallback, useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import moment from 'moment';
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
import compose from '../../../../libs/compose';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';

const propTypes = {
    ...withCurrentUserPersonalDetailsPropTypes,
};

function StatusPage({draftStatus, currentUserPersonalDetails}) {
    const localize = useLocalize();
    const currentUserEmojiCode = lodashGet(currentUserPersonalDetails, 'status.emojiCode', '');
    const currentUserStatusText = lodashGet(currentUserPersonalDetails, 'status.text', '');
    const draftEmojiCode = lodashGet(draftStatus, 'emojiCode');
    const draftText = lodashGet(draftStatus, 'text');

    const defaultEmoji = draftEmojiCode || currentUserEmojiCode;
    const defaultText = draftEmojiCode ? draftText : currentUserStatusText;
    const customStatus = draftEmojiCode ? `${draftEmojiCode} ${draftText}` : `${currentUserEmojiCode || ''} ${currentUserStatusText || ''}`;
    const hasDraftStatus = !!draftEmojiCode || !!draftText;

    const updateStatus = useCallback(() => {
        const endOfDay = moment().endOf('day').format('YYYY-MM-DD HH:mm:ss');
        User.updateCustomStatus({text: defaultText, emojiCode: defaultEmoji, clearAfter: endOfDay});

        User.clearDraftCustomStatus();
        Navigation.goBack(ROUTES.SETTINGS_PROFILE);
    }, [defaultText, defaultEmoji]);

    const clearStatus = () => {
        User.clearCustomStatus();
        User.clearDraftCustomStatus();
    };

    const footerComponent = useMemo(
        () =>
            hasDraftStatus ? (
                <Button
                    success
                    text={localize.translate('statusPage.save')}
                    onPress={updateStatus}
                />
            ) : null,
        [hasDraftStatus, localize, updateStatus],
    );

    useEffect(() => () => User.clearDraftCustomStatus(), []);

    return (
        <StaticHeaderPageLayout
            title={localize.translate('statusPage.status')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PROFILE)}
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
                inputID="test"
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_SET)}
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
