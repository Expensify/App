import React, {ReactNode} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {ExpensifyWordmark} from '@components/Icon/Expensicons';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import HorizontalRule from './HorizontalRule';

type EmailWrapperProps = {
    children: ReactNode;
    newDotLink: string;
};

const EmailWrapper: React.FC<EmailWrapperProps> = ({children}) => {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    return (
        <View style={[styles.p5]}>
            <Icon
                src={ExpensifyWordmark}
                width={variables.modalWordmarkWidth}
                height={variables.modalWordmarkHeight}
            />
            <HorizontalRule />
            {children}
            <HorizontalRule />
            <RenderHTML html={translate('notifications.replyOrOpenInExpensify', {url: 'https://dev.new.expensify.com:8082/'})} />
            <Icon
                src={ExpensifyWordmark}
                fill={theme.icon}
                width={variables.eReceiptWordmarkWidth}
                height="auto"
            />
            {/* TODO: address and unsubscribe link */}
        </View>
    );
};

EmailWrapper.displayName = 'EmailWrapper';

export default EmailWrapper;
