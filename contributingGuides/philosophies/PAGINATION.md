# Pagination Philosophy
## What is pagination?
Pagination is the art of loading a large amount of ordered data page-by-page, rather than all at once. It is a specialized form of lazy-loading that's suitable for ordered data that displays in a list.

## Why lazy-load data?
The goal of lazy-loading is to decouple the volume of data a user has access to from the app's performance when they use it. This makes it important to ensure that our largest, high-value customers share the same great app experience as a smaller customer.

It makes sense to lazy-load a resource when the volume of that resource is unbounded, or the upper bound of the resource is too costly to load all at once.

## Pagination vs. lazy-loading
As stated above, pagination is a specialized subset of lazy-loading for ordered lists of data. The advantage of structured pagination over a more naïve lazy-loading strategy is that it divides data into discrete chunks such that they can be loaded in batches (and that the order of those batches lends itself to a better product experience).

One example of data that's appropriate for pagination is reportActions (chat messages). We can load the 50 most recent messages, then scroll back and send one network request to get the next batch of 50.

One example of data that's appropriate to lazy-load but not necessarily ideal for pagination is avatar images. It's too costly to load all avatar images for all users when the app loads, so we only fetch avatar images that a user wants to see on-demand.

## Terminology

- Lazy-loading: Delaying the initialization or loading of a resource until it is actually needed (when the user or program first accesses it)
- Pagination: Loading a large amount of ordered data page-by-page, rather than all at once.
- Cursor: A "pointer" to a given item in the list, which has all the data needed to pinpoint the location of that item in the list.
- Jump: In the context of this doc, "jump" means to go immediately to a different point in the list without scrolling.
    - Example: Click on a link to a comment, and you are taken straight there, without scrolling.
- Unidirectional Pagination: Pagination where the user starts loading at one end of the list, and can only scroll and load pages in one direction.
    - Example: Report search page.
- Bidirectional Pagination: Pagination where the user can "jump" to any point in the list, and then can scroll and load pages in either direction.
    - Example: A long chat report, opened by deep-linking to an old message.
- Gap: Items missing between pages (can only happen under specific circumstances)

## How to implement pagination
1. Clearly define a sorting order of the data in question. No two items in the list may be considered equal in the sorting order.
2. Define a "cursor" - a unique piece of data that encapsulates all the data needed to pinpoint the location of a single item in the list.
    - Each item in the list MUST be unique. Typically this means the cursor should include an ID.
    - The cursor MUST be serializable so it can be sent in a network request. An example of something that's not serializable is a function.
    - The cursor SHOULD include only the minimal fields required to define the location of an item in the list.
    - _Example:_ For `reportActions`, we use the `created` timestamp, since `reportActions` are generally sorted by order of creation. A better cursor would have been a composite of:

        ```ts
        type ReportActionCursor = {
            /** The datetime when the reportAction was created, in ms precision. */
            created: string;

            /** The actionName is used as a tie-breaker when multiple reportActions are created in the same millisecond (i.e: CREATED actions always come first). */
            actionName: ReportActionName;

            /** The reportActionID is used as a tie-breaker when multiple reportActions of the same type are created in the same millisecond. */
            reportActionID: string;
        }
        ```

    - _Example:_ For a single search snapshot, an integer `sequenceNumber` is used. This is a simple implementation, but generally is not a scalable solution, because offset-based approaches require the database to scan and discard all prior rows up to the offset, which becomes slow for large dataset pagination. Furthermore, offset-based implementations are prone to gaps and/or duplicates:

        1. We fetch transactions 1-50
        2. Transaction 1 is deleted
        3. Transaction 51 becomes 50
        4. We fetch the next page, i.e. transactions 51-100
        5. The transaction that was 51 and is now 50 is never returned

3. Using the cursor as input, define a database query to _quickly_ access a limited number (a single page) of the resource in question. Test it for the highest volume of data available (i.e: the report with the most actions, the account with access to the most reports, etc...). If implemented well, the query execution time should be unaffected by the total search volume (the total length of the "list" that is being paged over).
    - A good starting point for this is to write the query using a [row value comparison](https://www.sqlite.org/rowvalue.html). Then, if necessary, consider creating a sorted `COVERING` index for the row value being searched over. For example:

        ```sql
        CREATE TABLE chatMessages (
            id       INTEGER PRIMARY KEY,     -- unique message ID
            created  DATETIME NOT NULL,       -- message creation timestamp
            message  TEXT NOT NULL
        );

        -- Create a sorted covering index for the cursor (sorting by created, tie-breaking with IDs)
        CREATE INDEX idx_chatMessages_created_id
            ON chatMessages (created, id);

        -- Query a single page using the cursor as the "OFFSET"
        SELECT *
        FROM chatMessages
        WHERE (created, id) < ('2025-09-01 10:02:00', 3)
        ORDER BY created DESC, id DESC
        LIMIT 50;
        ```

4. Determine whether the use-case calls for **unidirectional** or **bidirectional** pagination. Generally, **bidirectional** pagination will be useful if:

    - The list live-updates and the user can "jump" to an arbitrary point in the list without loading all the data between the start of the list and that point.
    - The list doesn't live-update (i.e: if a user scrolls back in the list, and while they're looking at older items, they're not receiving newer items as they come in).

    If bidirectional pagination is needed, ensure that queries and API endpoints fetch data from a given cursor in both directions. In the example query above, it could be as simple as switching `<` to `>=` and making the comparator and sort order explicit for each direction. Also ensure that if a front-end list library is used, it supports bidirectional pagination (i.e: both an `onEndReached` and `onStartReached` param).

5. Determine whether it's possible for **gaps** to appear in the data. Here is an example to help illustrate what a "gap" is and how we might end up with one:

    1. User has a simple paginated list of integers in ascending order, and the frontend has loaded items 1-50.
    2. User jumps to the middle of the list and the viewport contains items 15-35.
    3. While they're looking at the middle of the list, more than 1 page (50 items) of data is added to the front of the list. Let's say these items are items 50-150.
    4. They jump to the front of the list and then fetch page 100-150.
        - _Note:_ Fetching "all the data they missed" generally isn't a scalable solution, because it's unbounded, and the unbounded loading of data is the problem pagination seeks to solve.
    5. Now there is a gap between items 51-100 :boom:

    If a strategy for gap detection is required, here's a high-level summary of how it can be handled:

    1. Keep track of the pages loaded in a dedicated Onyx key for pagination (e.g., `report_123_actions_pages`). This is a _sorted_ list of ranges.
    2. Post-process network responses using the [Pagination middleware](/src/libs/Middleware/Pagination.ts) to keep track of the start and end point of the page loaded in a request, and [merge it with existing pages if it overlaps](/src/libs/PaginationUtils.ts#L104).
    3. When rendering the list, use that pages key for the sorting order, and insert "gap markers" between the edges of the pages that have been loaded.
    4. When rendering the list, [render only a single continuous chunk](/src/libs/PaginationUtils.ts#L166) containing the current "anchor point" (the reportAction linked to, for example), up until reaching the end of the list in either direction or a gap marker.
    5. Then, when scrolling, the gap marker will be reached and network requests can fill the gap.

    More details can be found in [the Pagination middleware](/src/libs/Middleware/Pagination.ts). Efforts were made to generalize this code, but so far it has only been used for reportActions.

## Rules

- The cursor for each item in the list MUST be unique.
- The cursor MUST be serializable so it can be sent in a network request (no functions).
- The cursor SHOULD include only the minimal fields required to define the location of an item in the list.
- Fetching an arbitrary page of results in the database MUST be fast.
- Pagination Middleware SHOULD be used to detect and fill gaps when gap detection is necessary.
- Data SHOULD NOT be evicted from disk, unless reading or writing from disk is clearly proven to be a bottleneck. This rule upholds our [Offline Philosophy](/contributingGuides/philosophies/OFFLINE.md) and provides a first-class offline UX without compromising performance.
