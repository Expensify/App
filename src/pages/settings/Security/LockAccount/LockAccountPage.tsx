import {useState} from 'react';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';

function LockAccountPage() {
    const {translate} = useLocalize();
    const [isModalVisible, setModalVisible] = useState(false);

    <ScreenWrapper
        includeSafeAreaPaddingBottom={false}
        testID={LockAccountPage.displayName}
    >
        <HeaderWithBackButton 
            title={translate('lockAccountPage.lockAccount')}
            onBackButtonPress={() => Navigation.dismissModal()}
        />
        <View>
            <Text>{translate('lockAccountPage.compromisedDescription')}</Text>

            <Text>{translate('lockAccountPage.domainAdminsDescription')}</Text>
        </View>
        <Button
            text={translate('lockAccountPage.lockAccount')}
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
