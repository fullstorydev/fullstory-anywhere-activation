# Fullstory Anywhere: Activation CLI

## Installation

Install a binary from the most recent [Release](https://github.com/fullstorydev/fullstory-anywhere-activation/releases). If you're unsure of which binary to use:

- **Apple** computers from 2020 onwards typically install the binary ending in **arm64.pkg**. Computers from 2006-2020 typically install the binary ending in **x64.pkg**.
- **Windows** computers with traditional Intel/AMD processors should install the binary ending in **x64.exe**. Windows on ARM devices should install the binary ending in **arm64.exe**.

## Getting Started

All CLI commands use a Fullstory API key to [authenticate](https://developer.fullstory.com/server/authentication/).

1. Run the `fs key:add` command to add your first API key.
2. When prompted, type the org ID (e.g. o-DeM0-na1) and hit enter.
3. Copy the link shown and open in your browser. This will take you to the Settings > Integrations > API Keys page in Fullstory.
4. Click the **Create key** button and follow instructions. The CLI requires either **Architect** or **Admin** permission.
5. Copy the provided API key, paste the key in the terminal, and hit enter.
6. Run your first command `fs segment` to verify the key was entered succesfully.

Your API key is stored locally and will be used by subsequent commands.

- List all API keys with `fs key`.
- Add another API key with `fs key:add`.
- Switch to a different API key with `fs key:use`.
- Remove an API key with `fs key:remove`.

## Commands

Many CLI commands use the format `fs <command>`, for example `fs segment`. Commands with extensive behavior use the format `fs <command>:<topic>`. To explore commands and topics available, refer to documentation:

- [`fs annotation`](docs/annotation.md) provides a way to create and apply annotations to Fullstory metrics using the [Annotation API](https://developer.fullstory.com/server/annotations/introduction/).
- [`fs event`](docs/event.md) provides access to create custom events using the [Events API](https://developer.fullstory.com/server/events/introduction/).
- [`fs export`](docs/export.md) schedules data exports based on Fullstory segments using the [Segment API](https://developer.fullstory.com/server/v1/segments/create-segment-export/).
- [`fs help`](docs/help.md) displays help documentation for the Activation CLI.
- [`fs key`](docs/key.md) manages [authentication](https://developer.fullstory.com/server/authentication/) and local management of Fullstory API keys.
- [`fs profile`](docs/profile.md) manages prompting instructions and session context configuration using the [Summary Profile API](https://developer.fullstory.com/server/sessions/create-profile/).
- [`fs segment`](docs/segment.md) lists segments from Fullstory using the [Segments API](https://developer.fullstory.com/server/v1/segments/list-segments/).
- [`fs session`](docs/session.md) provides access to session event data and context for real-time access and AI using the [Sessions API](https://developer.fullstory.com/server/sessions/introduction/).
- [`fs user`](docs/user.md) manages user objects using the [Users API](https://developer.fullstory.com/server/users/introduction/).

For any command and topic, use the `--help` flag to print the same documentation in the terminal.

- `fs --help`
- `fs segment --help`
- `fs profile:create --help`.
