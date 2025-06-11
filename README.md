# WMPR Service Desk Requests Table Plugin

This is a Jira Data Center plugin that displays the 10 most recent WMPR Service Desk requests in the portal footer.

## Features

- **Real-time Display**: Shows the 10 most recent WMPR project requests
- **Service Desk Integration**: Appears in the Service Desk portal footer
- **Auto-refresh**: Updates every 30 seconds automatically
- **Interactive Table**: Sortable columns with AtlasKit components
- **Request Details**: Shows key, summary, reporter, created date, and status
- **Direct Links**: Click on request keys to open individual requests

## Technical Stack

- **Backend**: Java 8, Jira API 8.8.1, Spring Framework
- **Frontend**: React 16.14.0, AtlasKit 16.x components, TypeScript
- **Build**: Maven multi-module, Webpack 5, Node.js 16.20.1

## Installation

1. Build the plugin: `atlas-mvn package`
2. Install the JAR file in Jira Administration > Add-ons
3. The table will automatically appear in the WMPR Service Desk portal footer

## Requirements

- Jira Data Center 8.8.1 or compatible
- WMPR project must exist
- Service Desk application enabled
