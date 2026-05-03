import React from 'react';
import type {ReactNode} from 'react';
import MenuItem from '@components/MenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {useContentActions, useContentNavigation} from './ContentContext';
import {getParentSubID, useSubContext} from './SubContext';
import useFocusableRow from './useFocusableRow';

type SubContentProps = {
    children: ReactNode;
    backButtonText?: string;
};

function BackButton({backButtonText, parentSubID}: {backButtonText?: string; parentSubID: string | null}): React.ReactElement {
    const {exitSub} = useContentActions(BackButton.displayName);
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const hasLabel = !!backButtonText;
    const labelText = backButtonText ?? translate('common.goBack');

    const {ref, focused, onPress, onFocus} = useFocusableRow({
        componentName: BackButton.displayName,
        visible: true,
        onActivate: () => exitSub(parentSubID),
    });

    return (
        <MenuItem
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

/** Renders the back button at active level; keeps children mounted at ancestor levels so nested `<Sub>` stays alive. */
function SubContent({children, backButtonText}: SubContentProps): React.ReactElement | null {
    // Resolved first so a "<SubContent> outside <Sub>" failure beats the also-true "outside <Content>" message
    // — Sub is the closer hierarchical neighbor and the more actionable hint.
    const subContext = useSubContext(SubContent.displayName);
    const {currentSubID, currentSubAncestorChain} = useContentNavigation(SubContent.displayName);

    const isActiveLevel = currentSubID === subContext.subID;
    const isAncestorOfActive = currentSubAncestorChain.includes(subContext.subID);

    if (!isActiveLevel && !isAncestorOfActive) {
        return null;
    }

    return (
        <>
            {isActiveLevel && (
                <BackButton
                    backButtonText={backButtonText}
                    parentSubID={getParentSubID(subContext)}
                />
            )}
            {children}
        </>
    );
}

BackButton.displayName = 'PopoverMenu.Sub.BackButton';
SubContent.displayName = 'PopoverMenu.SubContent';

export default SubContent;
export type {SubContentProps};
