import Button from '@components/ButtonComposed';
import HeaderWithBackButtonComposed from '@components/HeaderWithBackButtonComposed';
import Text from '@components/Text';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';

import type {Meta} from 'storybook-react-rsbuild';

import React from 'react';
import {View} from 'react-native';

/**
 * This is not a normal args-driven story. It renders every distinguishable use case of
 * `HeaderWithBackButtonComposed` stacked in one page, each captioned, so they can be compared
 * side by side. It exists specifically to make the right-side wrapper structure visible:
 *
 *   <View style={rightZoneStyle}>                         (outer — reportOptions: marginLeft 8,
 *                                                            separates the whole right side from
 *                                                            the center content)
 *     <View style={[pr2, flexRow, alignItemsCenter]}>      (inner — paddingRight 8, ALWAYS
 *       {children}                                          rendered even when empty; packs
 *       {downloadButton}                                     custom children + download tight,
 *     </View>                                                 zero gap between them)
 *     {threeDotsMenu}                                      (bare sibling of the inner wrapper —
 *     {closeButton}                                          zero gap from three-dots, because
 *   </View>                                                   pr2's padding already put 8px
 *                                                              between it and the inner wrapper)
 *
 * The inner wrapper's `pr2` is unconditional — it doesn't care whether anything follows it.
 * That's why nothing needs to detect "which conditional block renders first": the 8px gap is a
 * fixed property of the actions cluster itself, not a gap computed between two dynamic groups.
 */
const story: Meta<typeof HeaderWithBackButtonComposed> = {
    title: 'Components/HeaderWithBackButtonComposed',
    component: HeaderWithBackButtonComposed,
};

function Caption({children}: {children: React.ReactNode}) {
    const styles = useThemeStyles();
    return (
        <Text
            style={[styles.textLabelSupporting, styles.ph5, styles.mt3, styles.mb1]}
            numberOfLines={2}
        >
            {children}
        </Text>
    );
}

function SectionDivider({children}: {children: string}) {
    const styles = useThemeStyles();
    return <Text style={[styles.textHeadlineH2, styles.ph5, styles.mt6, styles.mb2, styles.borderBottom, styles.pb2]}>{children}</Text>;
}

function AllUseCases() {
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['Pencil', 'Trashcan', 'Plus']);

    const editMenuItem = {text: 'Edit', icon: icons.Pencil, onSelected: () => {}};
    const threeDotsMenuItems = [editMenuItem, {text: 'Delete', icon: icons.Trashcan, onSelected: () => {}}];

    return (
        <View style={styles.pb10}>
            <SectionDivider>Baseline — center content variants</SectionDivider>

            <Caption>Default: back button (default true) + title only. 434/531 real callsites are exactly this.</Caption>
            <HeaderWithBackButtonComposed title="Settings" />

            <Caption>shouldShowBackButton={'{false}'}: title flush left, no back arrow, no back-button negative margin applied.</Caption>
            <HeaderWithBackButtonComposed
                title="Settings"
                shouldShowBackButton={false}
            />

            <Caption>icon prop (34/531 callsites) — icon sits before the title, back button still first.</Caption>
            <HeaderWithBackButtonComposed
                title="Travel"
                icon={icons.Plus}
            />

            <Caption>shouldShowReportAvatarWithDisplay (2/531) — replaces the title slot entirely, mutually exclusive with title.</Caption>
            <HeaderWithBackButtonComposed
                title="unused when avatar shown"
                shouldShowReportAvatarWithDisplay
            />

            <SectionDivider>Right-side actions cluster — the inner pr2 wrapper</SectionDivider>

            <Caption>shouldShowDownloadButton alone (2/531) — sits inside the inner wrapper, no custom children next to it.</Caption>
            <HeaderWithBackButtonComposed
                title="Attachment"
                shouldShowDownloadButton
            />

            <Caption>Custom children alone (21/531, always a single action element) — same inner wrapper as download, just nothing else inside it.</Caption>
            <HeaderWithBackButtonComposed title="Workspace tags">
                <Button
                    variant="success"
                    onPress={() => {}}
                >
                    <Button.Text>Create</Button.Text>
                </Button>
            </HeaderWithBackButtonComposed>

            <Caption>
                Custom children + download TOGETHER — this is the case that proves the inner wrapper is a real cluster, not a coincidence. Zero gap between the Button and the download icon:
                both are bare siblings of the SAME `pr2`-wrapped View.
            </Caption>
            <HeaderWithBackButtonComposed
                title="Attachment"
                shouldShowDownloadButton
            >
                <Button onPress={() => {}}>
                    <Button.Text>Share</Button.Text>
                </Button>
            </HeaderWithBackButtonComposed>

            <SectionDivider>Menu cluster — bare siblings of the outer wrapper</SectionDivider>

            <Caption>shouldShowThreeDotsButton alone, 2+ items (7/531) — full ThreeDotsMenu trigger, no inner-wrapper content before it.</Caption>
            <HeaderWithBackButtonComposed
                title="Report"
                shouldShowThreeDotsButton
                threeDotsMenuItems={threeDotsMenuItems}
            />

            <Caption>
                shouldShowThreeDotsButton + exactly 1 item + shouldMinimizeMenuButton (2/531) — renders HeaderMenuItemButtonTooltip instead of the full menu (a single plain icon button, no
                popover).
            </Caption>
            <HeaderWithBackButtonComposed
                title="Category step"
                shouldShowThreeDotsButton
                shouldMinimizeMenuButton
                threeDotsMenuItems={[editMenuItem]}
            />

            <Caption>shouldShowCloseButton alone (4/531) — bare sibling of the outer wrapper too, same as three-dots.</Caption>
            <HeaderWithBackButtonComposed
                title="Modal"
                shouldShowCloseButton
            />

            <Caption>
                Three-dots + close TOGETHER — the case your question is really about. Zero gap between them: they&apos;re both bare children of `rightZoneStyle`, with no style between the
                two JSX expressions in index.tsx. The 8px gap you DO see is entirely produced by `pr2` padding-right on the inner wrapper that comes BEFORE them — not by anything between
                them.
            </Caption>
            <HeaderWithBackButtonComposed
                title="Modal"
                shouldShowThreeDotsButton
                shouldShowCloseButton
                threeDotsMenuItems={threeDotsMenuItems}
            />

            <SectionDivider>Full combo — everything on the right side at once</SectionDivider>

            <Caption>
                children + download (inner wrapper, tight) — then three-dots + close (bare siblings, tight to each other) — with exactly ONE visible 8px gap in between, produced by the inner
                wrapper&apos;s unconditional `pr2`. This is the whole reason the gap doesn&apos;t need to &quot;detect&quot; which conditional block comes first: `pr2` is a fixed property of
                the actions cluster, applied regardless of what follows it.
            </Caption>
            <HeaderWithBackButtonComposed
                title="Everything at once"
                shouldShowDownloadButton
                shouldShowThreeDotsButton
                shouldShowCloseButton
                threeDotsMenuItems={threeDotsMenuItems}
            >
                <Button onPress={() => {}}>
                    <Button.Text>Share</Button.Text>
                </Button>
            </HeaderWithBackButtonComposed>

            <SectionDivider>Top-level, outside any zone</SectionDivider>

            <Caption>
                shouldDisplaySearchRouter + shouldDisplayHelpButton (14 / 38 out of 531) — rendered AFTER the whole right-side View, not inside `rightZoneStyle` at all. More real usage than
                the entire three-dots/close/download cluster combined.
            </Caption>
            <HeaderWithBackButtonComposed
                title="Search"
                shouldDisplaySearchRouter
                shouldDisplayHelpButton
            />

            <SectionDivider>children vs SearchButton — does pr2 reach past the wrapper it&apos;s on?</SectionDivider>

            <Caption>1. No custom children, with SearchButton. Baseline: nothing in the actions cluster, so rightZoneStyle&apos;s box is empty except pr2&apos;s own padding.</Caption>
            <HeaderWithBackButtonComposed
                title="No children"
                shouldDisplaySearchRouter
            />

            <Caption>
                2. Custom children present, WITH SearchButton. SearchButton is a sibling OUTSIDE rightZoneStyle entirely — but rightZoneStyle&apos;s right edge still includes the inner
                wrapper&apos;s pr2 padding, so that 8px sits between the Button and the magnifier even though SearchButton was never inside the pr2 wrapper.
            </Caption>
            <HeaderWithBackButtonComposed
                title="Children + search"
                shouldDisplaySearchRouter
            >
                <Button onPress={() => {}}>
                    <Button.Text>Share</Button.Text>
                </Button>
            </HeaderWithBackButtonComposed>

            <Caption>3. Custom children present, WITHOUT SearchButton. Same Button, nothing after it at all — pr2&apos;s 8px is invisible empty space at the tail of the row.</Caption>
            <HeaderWithBackButtonComposed title="Children, no search">
                <Button onPress={() => {}}>
                    <Button.Text>Share</Button.Text>
                </Button>
            </HeaderWithBackButtonComposed>

            <SectionDivider>Container-level style variants</SectionDivider>

            <Caption>shouldUseHeadlineHeader (30/531) — taller bar, headline title font. Common with an icon (icon implies the new style).</Caption>
            <HeaderWithBackButtonComposed
                title="Headline style"
                icon={icons.Plus}
                shouldUseHeadlineHeader
            />

            <Caption>shouldShowBorderBottom (3/531) — adds a 1px border under the whole bar.</Caption>
            <HeaderWithBackButtonComposed
                title="With border"
                shouldShowBorderBottom
            />
        </View>
    );
}

export default story;
export {AllUseCases};
