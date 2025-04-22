import {useState} from 'react';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';

function LockAccountPage() {
    const {translate} = useLocalize();
    const [isModalVisible, setModalVisible] = useState(false);

    <ScreenWrapper
        includeSafeAreaPaddingBottom={false}
        testID={LockAccountPage.displayName}
    >
        <HeaderWithBackButton title={translate('mergeAccountsPage.lockAccountPage.lockAccount')} />
        <View>
            <Text>{translate('mergeAccountsPage.lockAccountPage.compromisedDescription')}</Text>

            <Text>{translate('mergeAccountsPage.lockAccountPage.domainAdminsDescription')}</Text>
        </View>
        <Button
            text={translate('mergeAccountsPage.lockAccountPage.lockAccount')}
            onPress={() => {}}
        />
        <Modal
            isVisible={isModalVisible}
            onClose={() => setModalVisible(false)}
        />
    </ScreenWrapper>;
}

LockAccountPage.displayName = 'LockAccountPage';
export default LockAccountPage;
