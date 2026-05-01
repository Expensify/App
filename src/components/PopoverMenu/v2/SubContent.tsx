import React from 'react';
import type {ReactNode} from 'react';
import FocusableMenuItem from '@components/FocusableMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {useContentActions, useContentState} from './ContentContext';
import {getParentSubId, useSubContext} from './SubContext';
import useFocusableRow from './useFocusableRow';

type SubContentProps = {
    children: ReactNode;
    backButtonText?: string;
};

function BackButton({backButtonText, parentSubId}: {backButtonText?: string; parentSubId: string | null}): React.ReactElement {
    const {exitSub} = useContentActions();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const hasLabel = !!backButtonText;
    const labelText = backButtonText ?? translate('common.goBack');

    const {ref, focused, onPress, onFocus} = useFocusableRow({
        visible: true,
        onActivate: () => exitSub(parentSubId),
    });

    return (
        <FocusableMenuItem
            ref={ref}
            icon={icons.BackArrow}
            iconFill={(isHovered) => (isHovered ? theme.iconHovered : theme.icon)}
            style={hasLabel ? styles.pv0 : undefined}
            additionalIconStyles={[{width: variables.iconSizeNormal, height: variables.iconSizeNormal}, styles.opacitySemiTransparent, styles.mr1]}
            iconStyles={[{width: variables.iconSizeNormal, height: variables.iconSizeNormal}]}
            wrapperStyle={[styles.ph5, styles.pv3]}
            innerContainerStyle={styles.alignItemsCenter}
            title={labelText}
            accessibilityLabel={`${translate('common.goBack')}, ${labelText}`}
            titleStyle={hasLabel ? styles.createMenuHeaderText : undefined}
            shouldShowBasicTitle={hasLabel}
            shouldCheckActionAllowedOnPress={false}
            onPress={onPress}
            onFocus={onFocus}
            focused={focused}
        />
    );
}

function SubContent({children, backButtonText}: SubContentProps): React.ReactElement {
    const {
        state: {currentSubId},
    } = useContentState();
    const subContext = useSubContext();

    // Children stay mounted so nested <Sub> survives navigation; only the back button is gated here.
    const isActiveLevel = currentSubId === subContext.subId;

    return (
        <>
            {isActiveLevel && (
                <BackButton
                    backButtonText={backButtonText}
                    parentSubId={getParentSubId(subContext)}
                />
            )}
            {children}
        </>
    );
}

SubContent.displayName = 'PopoverMenu.SubContent';

export default SubContent;
export type {SubContentProps};
