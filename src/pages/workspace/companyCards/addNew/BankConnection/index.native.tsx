import React, {useEffect, useRef, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import {WebView} from 'react-native-webview';
import type {ValueOf} from 'type-fest';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import useLocalize from '@hooks/useLocalize';
import getUAForWebView from '@libs/getUAForWebView';
import * as CompanyCards from '@userActions/CompanyCards';
import getCompanyCardBankConnection from '@userActions/getCompanyCardBankConnection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type BankConnectionStepProps = {
    policyID?: string;
};

function BankConnection({policyID}: BankConnectionStepProps) {
    const {translate} = useLocalize();
    const webViewRef = useRef<WebView>(null);
    const [isWebViewOpen, setWebViewOpen] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const authToken = session?.authToken ?? null;
    const [addNewCard] = useOnyx(ONYXKEYS.ADD_NEW_COMPANY_CARD);
    const bankName: ValueOf<typeof CONST.COMPANY_CARDS.BANKS> | undefined = addNewCard?.data?.selectedBank;
    const url = getCompanyCardBankConnection(policyID, bankName);

    const renderLoading = () => <FullScreenLoadingIndicator />;

    const handleBackButtonPress = () => {
        setWebViewOpen(false);
        if (bankName === CONST.COMPANY_CARDS.BANKS.BREX) {
            CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_BANK});
            return;
        }
        if (bankName === CONST.COMPANY_CARDS.BANKS.AMEX) {
            CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.AMEX_CUSTOM_FEED});
            return;
        }
        CompanyCards.setAddNewCompanyCardStepAndData({step: CONST.COMPANY_CARDS.STEP.SELECT_FEED_TYPE});
    };

    useEffect(() => {
        setWebViewOpen(true);
    }, []);

    return (
        <Modal
            onClose={handleBackButtonPress}
            fullscreen
            isVisible={isWebViewOpen}
            type={CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE}
        >
            <HeaderWithBackButton
                title={translate('workspace.companyCards.addCardFeed')}
                onBackButtonPress={handleBackButtonPress}
            />
            <FullPageOfflineBlockingView>
                {url && (
                    <WebView
                        ref={webViewRef}
                        source={{
                            uri: url,
                            headers: {
                                Cookie: `authToken=${authToken}`,
                            },
                        }}
                        userAgent={getUAForWebView()}
                        incognito
                        startInLoadingState
                        renderLoading={renderLoading}
                    />
                )}
            </FullPageOfflineBlockingView>
        </Modal>
    );
}

BankConnection.displayName = 'BankConnection';

export default BankConnection;
