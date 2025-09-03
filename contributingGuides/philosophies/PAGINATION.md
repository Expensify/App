# Pagination Philosophy
## What is pagination?
Pagination is the art of loading a large amount of ordered data page-by-page, rather than all at once.

## Why paginate?
The goal of pagination is to decouple the volume of data a user has access to from the app's performance when they use it. This makes it important to ensure that our largest, high-value customers share the same great app experience as a smaller customer.

It makes sense to paginate the loading of a resource when the volume of that is unbounded, or the upper bound of the resource is too costly to load all at once.

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
        CREATE TABLE messages (
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

4. TODO: Define two types of pagination (unidirectional and bidirectional), as that determines whether you need gap detection
5. TODO: Describe front-end with and without gap detection
6. TODO: Describe (aspirational) two-layer pagination (RAM -> Disk -> Server)
7. TODO: Describe (aspirational) data pre-loading
