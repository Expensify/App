import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import SafeAreaConsumer from '@components/SafeAreaConsumer';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

function HangTight({tempSubmit}: {tempSubmit: () => void}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const handleSendReminder = () => {
        // TODO remove that
        tempSubmit();
    };

    return (
        <SafeAreaConsumer>
            {({safeAreaPaddingBottomStyle}) => (
                <ScrollView
                    style={styles.pt0}
                    contentContainerStyle={[styles.flexGrow1, safeAreaPaddingBottomStyle]}
                >
                    <View style={[styles.flexGrow1, styles.justifyContentCenter, styles.alignItemsCenter]}>
                        <View style={styles.mb5}>
                            <Icon
                                width={144}
                                height={132}
                                src={Illustrations.Pillow}
                            />
                        </View>
                        <Text style={[styles.textHeadlineLineHeightXXL, styles.mh5, styles.mb3, styles.mt5]}>{translate('signerInfoStep.hangTight')}</Text>
                        <Text style={[styles.mutedTextLabel, styles.mh5]}>{translate('signerInfoStep.weAreWaiting')}</Text>
                    </View>
                    <View style={[styles.ph5, styles.pb5, styles.flexGrow1, styles.justifyContentEnd]}>
                        <Button
                            success
                            style={[styles.w100]}
                            onPress={handleSendReminder}
                            large
                            icon={Expensicons.Bell}
                            text={translate('signerInfoStep.sendReminder')}
                        />
                    </View>
                </ScrollView>
            )}
        </SafeAreaConsumer>
    );
}

HangTight.displayName = 'HangTight';

export default HangTight;
