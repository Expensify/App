## OVERVIEW

The Left Hand Navigation (LHN) is designed to show different types of reports based on their status, user settings, and specific conditions. Each report type has unique visual indicators and sorting rules to help users quickly identify and prioritize their tasks.

### Types of report displayed in the LHN

The following outlines the expected behavior regarding which reports are displayed in the LHN:

- The report currently being viewed by the user is highlighted as the active report in the LHN, making it easy for users to locate their focus point within the navigation.
If a report has unresolved issues, like an unapproved expense or outstanding violations, it will display a red dot next to it, indicating urgent action is required. These reports are displayed at the top of the LHN list (under pinned chats) and sorted alphabetically by report name for easy access.
- Reports that need user action, such as responding to a message that mentions them, completing an assigned task, or addressing an expense, will display a green dot next to them.  Additionally, if a system or concierge message indicates a trial period has expired and a payment method is missing, it will prompt the user with a similar green dot. This visual indicator helps users quickly identify where their attention is required.
- If a user has started drafting a comment in a report, a pencil icon as indicator appears next to it in the LHN, letting users know there is an incomplete draft. These reports are sorted alphabetically by report name.
- Pinned reports are always displayed at the top of the LHN list and are sorted alphabetically by name, giving quick access to reports the user wants to keep top-of-mind.
- When the user has focus mode enabled, unread chat messages will display in bold in the LHN. This also applies to reports where notifications are hidden. Unread chats in focus mode are sorted alphabetically by report name to help users locate them more easily.
- Archived reports are displayed in the LHN when the user is in default mode. These reports are shown with an indication that they are archived and are sorted by the date of the last visible action, with the most recent appearing first.
- Self-DM messages will now be displayed in LHN. This allows users who want to track their own notes or messages in the LHN to do so without needing to look elsewhere.

### Types of report excluded from the LHN

Certain reports are excluded from the LHN to avoid clutter and to focus on relevant content for the user:

- Reports that are explicitly marked as hidden.
- Reports with no participants are not displayed, as they lack meaningful content.
- If the user does not have permission to access a report (due to policy restrictions), it will not be shown.
- Transaction threads that contain only one transaction are excluded.
- If a report is an empty chat, unless it's a report user is actively looking at.
- For users with domain-based email addresses, reports are hidden if the includeDomainEmail setting is disabled.
- Reports with a parent message pending deletion.
- When focus mode is enabled and there are no unread messages.

### Sorting priorities for displayed report groups

1. Pinned, RBR and attention-required (GBR) reports:
    - Always sorted alphabetically by report name.
2.  Error reports:
    - Sorted alphabetically by report name.
3.  Draft reports:
    - Sorted alphabetically by report name.
4. Non-Archived reports:
    - In default mode, these are sorted by the lastVisibleActionCreated date, so the most recently updated reports appear first.
    - In focus mode, these reports are sorted alphabetically by name for quicker navigation.
5. Archived eports:
    - In default mode, these are sorted by lastVisibleActionCreated, with recent reports displayed first.
    - In focus mode, archived reports are sorted alphabetically by name.
