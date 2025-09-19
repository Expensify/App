# Data Flow Philosophy
Ideally, this is how data flows through the app:

1. Server pushes data to the disk of any client (Server -> Pusher event -> Action listening to pusher event -> Onyx).
2. Disk pushes data to the UI (Onyx -> withOnyx() -> React component).
3. UI pushes data to people's brains (React component -> device screen).
4. Brain pushes data into UI inputs (Device input -> React component).
5. UI inputs push data to the server (React component -> Action -> XHR to server).
6. Go to 1

    ![New Expensify Data Flow Chart](/contributingGuides/philosophies/data_flow.png)
