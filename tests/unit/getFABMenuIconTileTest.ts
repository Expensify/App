import getFABMenuIconTile from '@pages/inbox/sidebar/FABPopoverContent/getFABMenuIconTile';

import colors from '@styles/theme/colors';

import CONST from '@src/CONST';

const IDS = CONST.FAB_MENU_ITEM_IDS;

describe('getFABMenuIconTile', () => {
    it.each([
        [
            IDS.EXPENSE,
            {
                tileColor: colors.green700,
                iconColor: colors.green200,
                iconName: 'ReceiptMultiple',
            },
        ],
        [
            IDS.QUICK_ACTION,
            {
                tileColor: colors.green700,
                iconColor: colors.green200,
                shouldShowDividerAbove: true,
            },
        ],
        [
            IDS.CREATE_REPORT,
            {
                tileColor: colors.blue700,
                iconColor: colors.blue200,
                iconName: 'Document',
            },
        ],
        [
            IDS.TRACK_DISTANCE,
            {
                tileColor: colors.pink700,
                iconColor: colors.pink200,
                iconName: 'Location',
            },
        ],
        [
            IDS.NEW_CHAT,
            {
                tileColor: colors.yellow600,
                iconColor: colors.yellow100,
                iconName: 'CommentBubbles',
            },
        ],
        [
            IDS.INVOICE,
            {
                tileColor: colors.ice700,
                iconColor: colors.ice200,
                iconName: 'InvoiceGeneric',
            },
        ],
        [
            IDS.TRAVEL,
            {
                tileColor: colors.tangerine700,
                iconColor: colors.tangerine200,
                iconName: 'LuggageWithLines',
            },
        ],
        [
            IDS.NEW_WORKSPACE,
            {
                tileColor: colors.green500,
                iconColor: colors.green200,
                iconName: 'Building',
                shouldShowDividerAbove: true,
            },
        ],
    ])('returns the design tile for "%s"', (itemID, expected) => {
        // Given a known create menu item id
        // When the tile is requested
        const tile = getFABMenuIconTile(itemID);

        // Then it carries the fixed design colors, icon and divider flag so the tiles match the design in every theme
        expect(tile).toEqual(expected);
    });

    it('covers every create menu item id', () => {
        // Given every id the create menu can render
        // When a tile is requested for each
        const tiles = Object.values(IDS).map((itemID) => getFABMenuIconTile(itemID));

        // Then none is missing, so no row silently falls back to the plain look when a new id is added without a tile
        expect(tiles.every((tile) => tile !== undefined)).toBe(true);
    });

    it('returns undefined for an unknown item id', () => {
        // Given an id that is not a create menu item
        // When the tile is requested
        const tile = getFABMenuIconTile('not-a-real-item');

        // Then there is no tile, so such a row keeps its regular rendering
        expect(tile).toBeUndefined();
    });
});
