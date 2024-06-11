import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function ReducedFunctionalityMessage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return <Text style={[styles.ph5, styles.pb5, styles.textSupporting]}>{translate('subscription.mobileReducedFunctionalityMessage')}</Text>;
}

ReducedFunctionalityMessage.displayName = 'ReducedFunctionalityMessage';

export default ReducedFunctionalityMessage;
