import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import Navigation from '@libs/Navigation/Navigation';

function SelectDelegateRolePage() {
    const {translate} = useLocalize();

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={SelectDelegateRolePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('delegate.accessLevel')}
                subtitle={translate('delegate.accessLevelDescription')}
                onBackButtonPress={() => Navigation.goBack()}
            />
        </ScreenWrapper>
    );
}

SelectDelegateRolePage.displayName = 'SelectDelegateRolePage';

export default SelectDelegateRolePage;
