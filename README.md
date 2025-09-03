# Obsidian CORE Sync Plugin

> Sync your Obsidian notes with [CORE](https://heysol.ai/core) (Contextual Observation & Recall Engine) and get **memory-aware answers** directly inside Obsidian.

---

## ✨ What it does

-   **Sync Notes**: Push selected notes (or entire vault sections) into CORE as _Episodes_.
-   **Right-Side Panel**: Opens a dedicated panel in Obsidian that sends the current note’s content to CORE and shows **relevant results, links, or summaries**.
-   **Frontmatter Control**: Decide which notes to sync by adding simple YAML flags.
-   **Offline Safe**: Failed syncs are queued locally and retried automatically.

---

## Configuration

-   Go to Settings → CORE Sync to configure:
-   CORE Endpoint: Your CORE ingest/search API (e.g. https://core.heysol.ai).
-   API Key: Token for authenticating with CORE.
-   Auto-sync on modify: If enabled, every note edit will sync automatically.

---

## 🛠️ Usage

1. **Mark a note for sync**

    Add the following frontmatter at the top of a note to mark it for synchronization:

    ```yaml
    ---
    core.sync: true
    ---
    ```

2. **Sync manually**

    To sync a note manually, open the command palette (Cmd/Ctrl + P) and run:

    - "Sync current note to CORE" to sync the currently open note.
    - "Sync all notes with core.sync=true" to sync all notes marked for synchronization.

3. **Right-Side CORE Panel**

    Open the CORE Panel by running "Open CORE Panel" from the command palette. This will open a new tab on the right side of Obsidian. When you open or edit a note, the plugin will automatically send its content to CORE and display:

---

## 🚀 Installation

### Local development

1. Download the latest release assets from [core-obsidian v0.1.0](https://github.com/RedPlanetHQ/core-obsidian/releases/tag/0.1.0) and extract them into your Obsidian vault under `.obsidian/plugins/obsidian-core-sync/`:

    - Ensure the directory contains `main.js`, `style.css`, and `manifest.json`.

2. Enable the plugin in Obsidian:
    - Go to **Settings** → **Community plugins**
    - Find "CORE Sync" and toggle it on
