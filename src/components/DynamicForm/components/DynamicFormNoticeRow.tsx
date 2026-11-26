/** Advice about the whole page of a schema-driven form, such as a limit on what the account can receive, drawn as a banner so it reads apart from the hint of a single field */
import Banner from '@components/Banner';
import getLocalizedText from '@components/DynamicForm/utils/getLocalizedText';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {DynamicFormNotice} from '@src/types/onyx';

import React from 'react';

type DynamicFormNoticeRowProps = {
    notice: DynamicFormNotice;
};

function DynamicFormNoticeRow({notice}: DynamicFormNoticeRowProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Lightbulb']);

    return (
        <Banner
            text={getLocalizedText(translate, notice.textKey, notice.text)}
            icon={icons.Lightbulb}
            iconSize={CONST.ICON_SIZE.SMALL}
            shouldShowIcon
            containerStyles={[styles.highlightBG, styles.mv2, styles.p4, styles.br3]}
            textStyles={[styles.breakWord, styles.textLabelSupporting]}
        />
    );
}

export default DynamicFormNoticeRow;
