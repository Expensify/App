# Response Handling
## READ Responses
## WRITE Responses
## Hybrid READ/WRITE Responses
# Naming Conventions
## Command Names
- Names must be unique for every user action. Each user action should results in at most 1 API request.
- Names must not be shared with our old (now deprecated API)
- Names must always have the format of `<Verb><Noun>` eg. `TransferMoney` `SelectEmoji`
- Verbs should be unique and indicate the user's action (as perceived by the user). eg. `Request`, `Open`, `Accept`, `Pay`
  - If a unique verb cannot be used, then use only the standard verbs: `Update`, `Add`, `Delete`
