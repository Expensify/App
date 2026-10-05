import FormHelpMessage from '@components/FormHelpMessage';
import ScrollView from '@components/ScrollView';

import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';

import type {Errors} from '@src/types/onyx/OnyxCommon';

import type {StyleProp, ViewStyle} from 'react-native';

import {View} from 'react-native';

type ConfirmationPageContentProps = {
    requestErrors?: Errors | null;
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
};

function ConfirmationPageContent({requestErrors, style, children}: ConfirmationPageContentProps) {
    const styles = useThemeStyles();

    return (
        <View style={styles.flex1}>
            <ScrollView contentContainerStyle={styles.flexGrow1}>
                <View style={[styles.screenCenteredContainer, styles.alignItemsCenter, style]}>{children}</View>
            </ScrollView>
            {!!requestErrors && (
                <View style={[styles.pAbsolute, styles.b0, styles.l0, styles.r0, styles.ph5]}>
                    <FormHelpMessage
                        message={getLatestErrorMessage({errors: requestErrors})}
                        style={styles.mb0}
                    />
                </View>
            )}
        </View>
    );
}

export default ConfirmationPageContent;
