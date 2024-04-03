import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import InteractiveStepSubHeader from '@components/InteractiveStepSubHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useSubStep from '@hooks/useSubStep';
import {SubStepProps} from '@hooks/useSubStep/types';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import getInitialSubstepForPersonalInfo from '@pages/ReimbursementAccount/utils/getInitialSubstepForPersonalInfo';
import * as Wallet from '@userActions/Wallet';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {UserWallet} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import Address from './substeps/Address';
import Confirmation from './substeps/Confirmation';
import DateOfBirth from './substeps/DateOfBirth';
import FullName from './substeps/FullName';
import SocialSecurityNumber from './substeps/SocialSecurityNumber';

type EnablePaymentsPageOnyxProps = {
    /** The user's wallet */
    userWallet: OnyxEntry<UserWallet>;
};

type EnablePaymentsPageProps = EnablePaymentsPageOnyxProps;

const PERSONAL_INFO_STEP_KEYS = INPUT_IDS.PERSONAL_INFO_STEP;
const bodyContent: Array<React.ComponentType<SubStepProps>> = [FullName, DateOfBirth, SocialSecurityNumber, Address, Confirmation];

function EnablePaymentsPage({userWallet}: EnablePaymentsPageProps) {
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();

    const {isPendingOnfidoResult, hasFailedOnfido} = userWallet ?? {};

    const submit = () => {};

    const values = {};

    useEffect(() => {
        if (isOffline) {
            return;
        }

        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        if (isPendingOnfidoResult || hasFailedOnfido) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET, CONST.NAVIGATION.TYPE.UP);
            return;
        }

        Wallet.openEnablePaymentsPage();
    }, [isOffline, isPendingOnfidoResult, hasFailedOnfido]);

    const startFrom = useMemo(() => getInitialSubstepForPersonalInfo(values), [values]);

    const {componentToRender: SubStep, isEditing, screenIndex, nextScreen, prevScreen, moveTo, goToTheLastStep} = useSubStep({bodyContent, startFrom, onFinished: submit});

    if (isEmptyObject(userWallet)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            shouldShowOfflineIndicator={userWallet?.currentStep !== CONST.WALLET.STEP.ONFIDO}
            includeSafeAreaPaddingBottom={false}
            testID={EnablePaymentsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('personalInfoStep.personalInfo')}
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS)}
            />
            <View style={[styles.ph5, styles.mb5, styles.mt3, {height: CONST.BANK_ACCOUNT.STEPS_HEADER_HEIGHT}]}>
                <InteractiveStepSubHeader
                    startStepIndex={1}
                    stepNames={CONST.WALLET.STEP_NAMES}
                />
            </View>
            <SubStep
                isEditing={isEditing}
                onNext={nextScreen}
                onMove={moveTo}
            />
        </ScreenWrapper>
    );
}

EnablePaymentsPage.displayName = 'EnablePaymentsPage';

export default withOnyx<EnablePaymentsPageProps, EnablePaymentsPageOnyxProps>({
    userWallet: {
        key: ONYXKEYS.USER_WALLET,

        // We want to refresh the wallet each time the user attempts to activate the wallet so we won't use the
        // stored values here.
        initWithStoredValues: false,
    },
})(EnablePaymentsPage);
