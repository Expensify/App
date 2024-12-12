/**
 * An array of arrays of IDs, representing pages of a resource fetched via pagination.
 *
 * Here's an example (assuming a page size of 5 and sequential IDs):
 *
 * 1. Open a report, fetch the latest reportActions. Pages would look like this:
 *
 *    [
 *      [
 *        11,
 *        12,
 *        13,
 *        14,
 *        15,
 *      ],
 *    ]
 *
 * 2. Click on a link to reportAction 7. Now Pages looks like this:
 *
 *    [
 *      [
 *        5,
 *        6,
 *        7,
 *        8,
 *        9,
 *      ],
 *      // This space between these non-continuous pages represents a gap that must be filled
 *      [
 *        11,
 *        12,
 *        13,
 *        14,
 *        15,
 *      ],
 *    ]
 *
 * 3. Scroll down, load more actions after reportAction 9
 *
 *    [
 *      [
 *        5,
 *        6,
 *        7,
 *        8,
 *        9,
 *        // Note: the gap is filled and the pages are now continuous/merged together
 *        10,
 *        11,
 *        12,
 *        13,
 *        14,
 *        15,
 *      ],
 *    ]
 */
type Pages = string[][];

export default Pages;
