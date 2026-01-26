import React, {useEffect} from 'react';
import {Keyboard, View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Text from '@components/Text';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {normalizeLogin} from '@libs/LoginUtils';
import {clearSignInData} from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';

function EmailDeliveryFailurePage() {
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});
    const styles = useThemeStyles();
    const {isKeyboardShown} = useKeyboardState();
    const {translate} = useLocalize();

    const login = normalizeLogin(credentials?.login);

    // This view doesn't have a field for user input, so dismiss the device keyboard if shown
    useEffect(() => {
        if (!isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    }, [isKeyboardShown]);

    return (
        <>
            <View style={[styles.mv3, styles.flexRow]}>
                <View style={[styles.flex1]}>
                    <Text>{translate('emailDeliveryFailurePage.ourEmailProvider', {login})}</Text>
                    <View style={[styles.mt5, styles.renderHTML]}>
                        <RenderHTML html={translate('emailDeliveryFailurePage.confirmThat', login)} />
                    </View>
                    <View style={[styles.mt5, styles.renderHTML]}>
                        <RenderHTML html={translate('emailDeliveryFailurePage.ensureYourEmailClient')} />
                    </View>
                    <View style={[styles.mt5, styles.renderHTML]}>
                        <RenderHTML html={translate('emailDeliveryFailurePage.onceTheAbove')} />
                    </View>
                </View>
            </View>
            <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                <PressableWithFeedback
                    onPress={() => clearSignInData()}
                    role="button"
                    accessibilityLabel={translate('common.back')}
                    // disable hover dim for switch
                    hoverDimmingValue={1}
                    pressDimmingValue={0.2}
                >
                    <Text style={[styles.link]}>{translate('common.back')}</Text>
                </PressableWithFeedback>
            </View>
        </>
    );
}

export default EmailDeliveryFailurePage;
