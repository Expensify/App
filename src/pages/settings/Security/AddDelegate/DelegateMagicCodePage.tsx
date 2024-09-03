import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import HeaderPageLayout from '@components/HeaderPageLayout';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {addDelegate} from '@libs/actions/Delegate';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DelegateMagicCodePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM>;

function DelegateMagicCodePage({route}: DelegateMagicCodePageProps) {
    const {translate} = useLocalize();

    const styles = useThemeStyles();
    const accountID = Number(route.params.accountID);
    const role = route.params.role as ValueOf<typeof CONST.DELEGATE_ROLE>;
    const [validateCode, setValidateCode] = useState('');

    const personalDetails = PersonalDetailsUtils.getPersonalDetailsByIDs([accountID], -1)[0];

    const submitButton = (
        <Button
            success
            large
            text={translate('common.verify')}
            style={styles.mt6}
            pressOnEnter
            onPress={() => {
                addDelegate(personalDetails.login ?? '', role, validateCode);
                Navigation.dismissModal();
            }}
        />
    );

    return (
        <HeaderPageLayout
            onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_DELEGATE_CONFIRM.getRoute(accountID, role))}
            title={translate('delegate.addCopilot')}
            testID={DelegateMagicCodePage.displayName}
            footer={submitButton}
            childrenContainerStyles={[styles.pt3, styles.gap6]}
        >
            <Text style={[styles.ph5]}>{translate('delegate.confirmCopilot')}</Text>
        </HeaderPageLayout>
    );
}

DelegateMagicCodePage.displayName = 'DelegateMagicCodePage';

export default DelegateMagicCodePage;
