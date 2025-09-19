# Pagination Philosophy
## What is pagination?
Pagination is the art of loading a large amount of ordered data page-by-page, rather than all at once. It is a specialized form of lazy-loading that's suitable for ordered data that displays in a list.

## Why lazy-load data?
The goal of lazy-loading is to decouple the volume of data a user has access to from the app's performance when they use it. This makes it important to ensure that our largest, high-value customers share the same great app experience as a smaller customer.

It makes sense to lazy-load a resource when the volume of that resource is unbounded, or the upper bound of the resource is too costly to load all at once.

## Pagination vs. lazy-loading
As stated above, pagination is a specialized subset of lazy-loading for ordered lists of data. The advantage of structured pagination over a more naïve lazy-loading strategy is that it divides data into discrete chunks such that they can be loaded in batches (and that the order of those batches lends itself to a better product experience).

One example of data that's appropriate for pagination is reportActions (chat messages). We can load the 50 most recent messages, then scroll back and send one network request to get the next batch of 50.

One example of data that's appropriate to lazy-load but not necessarily ideal for pagination is avatar images. It's too costly to load all avatar images for all users when the app loads, so we only fetch avatar images that a user wants to see on-demand. Another example might be `personalDetails`.

## How to implement pagination
1. Clearly define a deterministic sorting order of the data in question.
2. Define a "cursor" - a unique piece of data that encapsulates all the data you need to pinpoint the location of a single item in the list.
    - Each item in the list _MUST_ be unique. No ties allowed: typically this means your cursor should include an ID.
    - The cursor _MUST_ be serializable so it can be sent in a network request.
    - The cursor _SHOULD_ include only the minimal fields required to define the location of an item in the list.
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

    - _Example:_ For a single search snapshot, an integer `sequenceNumber` is used. This is a simple implementation, but generally is not a scalable solution, because it requires that all the data you're paging over needs to be sorted before you can access it by an integer offset and limit.

3. Using your cursor as inputs, define a database query to _quickly_ access a limited number (a single page) of the resource in question. Test it for the highest volume of data you can find (i.e: the report with the most actions, the account with access to the most reports, etc...). If you do this well, you should find that the query execution time is unaffected by the total search volume (the total length of the "list" that you're paging over).
    - A good starting point for this is to write your query using a [row value comparison](https://www.sqlite.org/rowvalue.html). Then, if necessary, consider creating a sorted `COVERING` index for the row value you're searching over. For example:

        ```sql
        CREATE TABLE chatMessages (
            id       INTEGER PRIMARY KEY,     -- unique message ID
            created  DATETIME NOT NULL,       -- message creation timestamp
            message  TEXT NOT NULL
        );

        -- Create a sorted covering index for the cursor (sorting by created, tie-breaking with IDs)
        CREATE INDEX idx_chatMessages_created_id
            ON chatMessages (created, id);

        -- Query a single page using your cursor as the "OFFSET"
        SELECT *
        FROM chatMessages
        WHERE (created, id) < ('2025-09-01 10:02:00', 3)
        ORDER BY created DESC, id DESC
        LIMIT 50;
        ```

4. Determine whether your use-case calls for **unidirectional** or **bidirectional** pagination. Generally, **bidirectional** pagination will be useful if:

    - The list live-updates and the user can "jump" to an arbitrary point in the list without loading all the data between the start of the list and that point.
    - The list doesn't live-update (i.e: if a user scrolls back in the list, and while they're looking at older items, they're not receiving newer items as they come in).

    If you need bidirectional pagination, you'll need to ensure that you craft queries and API endpoints to fetch data from a given cursor in both directions. In the example query above, it could be as simple as switching `<` to `>=` and making the comparator and sort order explicit for each direction.

> [!NOTE]
> At the time of writing, [RecyclerListView](https://github.com/Flipkart/recyclerlistview) and [FlashList](https://github.com/Shopify/flash-list) _do not_ support bidirectional pagination.
> React Native's built-in [FlatList](https://reactnative.dev/docs/flatlist) and [legend-list](https://github.com/LegendApp/legend-list) are some examples that _do_ support bidirectional pagination via the `onStartReached` prop.

5. Determine whether it's possible for **gaps** to appear in your data. It's non-trivial to list all the ways gaps can appear in a list, but here are a couple of examples, one real and one contrived:
    - "Comment linking"
        1. User has a simple paginated list of integers in ascending order, and it currently contains items 1-50.
        2. User jumps to the middle of the list (say for simplicity that they are looking at items 15-35)
        3. While they're looking at the middle of the list, more than 1 page (50 items) of data is added to the front of the list. Let's say these items are items 50-150.
        4. They jump back to the front of the page, and fetch the page at the front, 100-150.
            - _Note:_ Fetching "all the data they missed" generally isn't a scalable solution, because it's unbounded, and the unbounded loading of data is the problem pagination seeks to solve.
        5. Now there is a gap between items 51-100 :boom:
    - "Over-eager eviction"
        1. A user scrolls far back in the list. So far that we decide there's too much data for us to handle all at once. Performance degrades, and we decide to start evicting the data at the front that's less-recently viewed. Let's say that the user now has items 50-100 loaded, and we've evicted items 101-200.
        2. New data appears at the front of the list, say items 201-250. We add these items to the list as we normally would if they're looking at the front of the list.
        3. Now there is a gap between items 101-200 (the data we evicted) :boom:

    If it turns out you _do_ need a strategy for gap detection, here's a high-level summary of how you'd handle it:

    1. Start keeping track of the pages you've loaded in a dedicated Onyx key for pagination (e.g., `report_123_actions_pages`). This is a _sorted_ list of ranges.
    2. Post-process network responses using the [Pagination middleware](https://github.com/Expensify/App/blob/1a06fa4add10b53a1a9266927d3b08a4ca35d3c4/src/libs/Middleware/Pagination.ts) to keep track of the start and end point of the page you loaded in a request, and [merge it with existing pages if it overlaps](https://github.com/Expensify/App/blob/1a06fa4add10b53a1a9266927d3b08a4ca35d3c4/src/libs/PaginationUtils.ts#L104).
    3. When rendering your list, use that pages key for your sorting order, and insert "gap markers" between the edges of the pages you've loaded.
    4. When rendering your list, [only render a single continuous chunk](https://github.com/Expensify/App/blob/1a06fa4add10b53a1a9266927d3b08a4ca35d3c4/src/libs/PaginationUtils.ts#L166) containing your current "anchor point" (the reportAction you linked to, for example), up until you reach the end of the list in either direction or a gap marker.
    5. Then when you scroll, you'll hit your gap marker and can make network requests to fill in the gap.

    More details can be found in [the Pagination middleware](https://github.com/Expensify/App/blob/1a06fa4add10b53a1a9266927d3b08a4ca35d3c4/src/libs/Middleware/Pagination.ts). Efforts were made to generalize this code, but so far it has only been used for reportActions.

## Future improvements
The following ideals have not (yet) been implemented in Expensify, but we'll hold them out here as aspirational goals for future pagination systems, inspired by WhatsApp.

### Layered Pagination
The pagination systems we've described so far paginate data from the client to the server. i.e: client loads one page, then when they reach the edge of the page they ask the server for the next page. This goes a long way to decouple the total volume of data a user has access to from their app's performance.

However, the systems we've built and/or described have no data eviction. Once data has been downloaded from the server, it's saved to disk, and because of the design of Onyx all that data is typically kept in RAM in the Onyx cache. If this starts to become a problem ([it has been discussed before](https://expensify.slack.com/archives/C05LX9D6E07/p1755077335799619)), throwing away data on disk is not the best approach. Instead, we should build a two-layer pagination system:

1. Data is loaded into RAM one page at a time.
2. If we reach the edge of the page, we first check the disk for more.
3. Only if the page we requested is not on disk, we request it from the server.
4. If data must be evicted due to slow performance, it is first evicted from RAM.
5. Data should be evicted from disk only if reading data from disk becomes a bottleneck, or we reach device storage limits.

That way, we can preserve our [Offline Philosophy](https://github.com/Expensify/App/blob/main/contributingGuides/philosophies/OFFLINE.md) and provide a first-class offline UX without compromising performance.

### Data pre-loading
If we had a layered pagination system in place, and we could performantly handle very high volumes of data on-device, then another future improvement could be to pre-load many pages of data when the app loads, before the client even requests them, and store them directly on disk. That provides a premium offline-first experience, with most pages of data a user is likely to need loading immediately from disk.
