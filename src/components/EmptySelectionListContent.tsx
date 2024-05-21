import React from 'react';
import useLocalize from '@hooks/useLocalize';
import variables from '@styles/variables';
import type {IOUType} from '@src/CONST';
import BlockingView from './BlockingViews/BlockingView';
import * as Illustrations from './Icon/Illustrations';

type EmptySelectionListContentProps = {
    content: IOUType | 'startChat' | 'assignTask';
};

function EmptySelectionListContent({content}: EmptySelectionListContentProps) {
    const {translate} = useLocalize();

    return (
        <BlockingView
            icon={Illustrations.ToddWithPhones}
            iconWidth={variables.modalTopIconWidth}
            iconHeight={variables.modalTopIconHeight}
            title={translate(`emptyList.${content}.title`)}
            shouldShowLink={false}
            subtitle={translate(`emptyList.${content}.subtitle`)}
        />
    );
}

EmptySelectionListContent.displayName = 'EmptySelectionListContent';

export default EmptySelectionListContent;
