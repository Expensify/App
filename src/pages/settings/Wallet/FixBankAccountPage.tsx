import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';

import Navigation from '@libs/Navigation/Navigation';

import {DYNAMIC_ROUTES} from '@src/ROUTES';

function FixBankAccountPage() {
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.FIX_BANK_ACCOUNT.path);

    const onDismiss = () => Navigation.dismissModal();
    const onBack = () => Navigation.goBack(backPath);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID={FixBankAccountPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('walletPage.fixBankAccount.title')}
                onBackButtonPress={onBack}
            />
            <FullPageNotFoundView />
        </ScreenWrapper>
    );
}

FixBankAccountPage.displayName = 'FixBankAccountPage';

export default FixBankAccountPage;
