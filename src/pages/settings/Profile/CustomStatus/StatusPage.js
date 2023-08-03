import React, {useMemo, useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
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

function StatusPage(props) {
    const localize = useLocalize();

    const defaultEmoji = props.draftStatus?.emojiCode || props.currentUserPersonalDetails?.status?.emojiCode || '';
    const defaultText = props.draftStatus?.text || props.currentUserPersonalDetails?.status?.text || '';
    const hasDraftStatus = !!defaultEmoji || !!defaultText;

    const updateStatus = useCallback(() => {
        // TODO: part of next PR
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        User.updateCustomStatus({text: defaultText, emojiCode: defaultEmoji, clearAfter: endOfDay});
        
        User.clearDraftCustomStatus();
        Navigation.goBack(ROUTES.SETTINGS);
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

    return (
        <StaticHeaderPageLayout
            title={localize.translate('statusPage.status')}
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS)}
            backgroundColor={themeColors.midtone}
            image={MobileBackgroundImage}
            footer={footerComponent}
        >
            <View style={styles.m5}>
                <Text style={[styles.textHeadline]}>{localize.translate('statusPage.setStatusTitle')}</Text>
                <Text style={[styles.textNormal, styles.mt2]}>{localize.translate('statusPage.statusExplanation')}</Text>
            </View>
            <MenuItemWithTopDescription
                title={`${defaultEmoji} ${defaultText}`}
                description="Status"
                shouldShowRightIcon
                inputID="test"
                onPress={() => Navigation.navigate(ROUTES.SETTINGS_STATUS_SET)}
            />
            <MenuItemWithTopDescription
                title={localize.translate('statusPage.today')}
                description="Clear after"
                shouldShowRightIcon
                onPress={() => {}}
            />

            {hasDraftStatus && (
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
        status: {
            key: () => ONYXKEYS.PERSONAL_DETAILS,
        },
        draftStatus: {
            key: () => ONYXKEYS.CUSTOM_STATUS_DRAFT,
        },
    }),
)(StatusPage);
