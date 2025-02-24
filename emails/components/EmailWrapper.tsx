import React, {ReactNode} from 'react';
import {View} from 'react-native';
import HTMLEngineProvider from '@components/HTMLEngineProvider';
import Icon from '@components/Icon';
import {ExpensifyWordmark} from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';

interface EmailWrapperProps {
    children: ReactNode;
    newDotLink: string;
}

const EmailWrapper: React.FC<EmailWrapperProps> = ({children}) => {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <HTMLEngineProvider>
            <View style={[styles.alignItemsCenter, styles.p5]}>
                <Icon
                    src={ExpensifyWordmark}
                    width={variables.modalWordmarkWidth}
                    height={variables.modalWordmarkHeight}
                />
                <hr />
                {children}
                <hr />
                <RenderHTML html={translate('notifications.replyOrOpenInExpensify')} />
                <Icon
                    src={ExpensifyWordmark}
                    fill={theme.icon}
                />
                {/* TODO: address and unsubscribe link */}
            </View>
        </HTMLEngineProvider>
    );
};

export default EmailWrapper;
