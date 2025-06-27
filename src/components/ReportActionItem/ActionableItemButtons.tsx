import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {TranslationPaths} from '@src/languages/types';
import { useAccountingContext } from '@pages/workspace/accounting/AccountingContext';
import CONST from '@src/CONST';

type ActionableItem = {
    isPrimary?: boolean;
    key: string;
    onPress: () => void;
    text: string;
    shouldUseLocalization?: boolean;
};

type ActionableItemButtonsProps = {
    items: ActionableItem[];
    layout?: 'horizontal' | 'vertical';
    shouldUseLocalization?: boolean;
};

function ActionableItemButtons(props: ActionableItemButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {startIntegrationFlow} = useAccountingContext();

    return (
        <View style={[props.layout === 'horizontal' ? styles.flexRow : [styles.flexColumn, styles.alignItemsStart], styles.gap2, styles.mt2]}>
            {props.items?.map((item) => (
                <Button
                    key={item.key}
                    onPress={() => {
                        if (item.text.includes('connect')) {
                            startIntegrationFlow({name: CONST.POLICY.CONNECTIONS.NAME.QBO});
                            return;
                        }
                        item.onPress();
                    }}
                    text={props.shouldUseLocalization ? translate(item.text as TranslationPaths) : item.text}
                    medium
                    success={item.isPrimary}
                />
            ))}
        </View>
    );
}

ActionableItemButtons.displayName = 'ActionableItemButtons';

export default ActionableItemButtons;
export type {ActionableItem};
