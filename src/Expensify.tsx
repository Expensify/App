import {View} from 'react-native';
import SplashScreenHider from './components/SplashScreenHider';
import TextInput from './components/TextInput';
import BaseTextInput from './components/TextInput/BaseTextInput';
import useThemeStyles from './hooks/useThemeStyles';
import MoneyRequestAmountForm from './pages/iou/MoneyRequestAmountForm';

export default function Expensify() {
    const styles = useThemeStyles();
    return (
        <View
            style={{
                flex: 1,
                justifyContent: 'center',
                // alignItems: 'center',
            }}
        >
            {/* <BaseTextInput
                autoGrow
                autoFocus
                shouldDelayFocus
                placeholder="0"
                inputStyle={[styles.baseTextInput]}
                // containerStyles={styles.iouAmountTextInputContainer}
            /> */}
            <MoneyRequestAmountForm onSubmitButtonPress={() => {}} />

            <SplashScreenHider onHide={() => {}} />
        </View>
    );
}
