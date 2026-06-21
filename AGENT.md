# Agent Notes

## Release workflow

- After every project version update, commit the completed changes locally.
- Before each GitHub sync, update the development changelog with a clear summary of what changed in that version.
- Push each committed update to the GitHub repository `rangooolol/rangooolol.github.io`.
- Keep the published GitHub Pages site in sync with the latest working version.
- Before reporting completion to the user, confirm the local checks passed and the GitHub push succeeded.
- Preview servers must be started in the background only. Before starting, check the target port, write stdout/stderr to log files, and verify the port is listening; never run a long-lived foreground preview command that blocks the conversation.
