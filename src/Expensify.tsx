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
                alignItems: 'center',
            }}
        >
            <BaseTextInput
                autoGrow
                autoFocus
                shouldDelayFocus
                placeholder="0"
                inputStyle={[
                    // styles.baseTextInput,
                    {},
                    {
                        fontSize: 40,
                        color: 'white',
                        // height: 52,
                        // borderBottomLeftRadius: 0,
                        // borderBottomRightRadius: 0,
                        // borderTopLeftRadius: 0,
                        // borderTopRightRadius: 0,
                        // borderWidth: 0,
                        // fontFamily: 'Expensify New Kansas',
                        // fontStyle: 'normal',
                        // fontWeight: '500',
                        // lineHeight: undefined,
                        // paddingBottom: 0,
                        // paddingHorizontal: 0,
                        // paddingLeft: 0,
                        // paddingRight: 4,
                        // paddingTop: 0,
                        // paddingVertical: 0,
                    },
                ]}
                // containerStyles={styles.iouAmountTextInputContainer}
            />
            {/* <MoneyRequestAmountForm onSubmitButtonPress={() => {}} /> */}

            <SplashScreenHider onHide={() => {}} />
        </View>
    );
}
