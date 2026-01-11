# IG-Scraper

> **Status**: v0.x Experimental - API may change

Instagram scraping library built with TypeScript that provides a stable, maintained foundation for extracting Instagram data using unofficial methods via browser automation (Playwright + Chromium).

## ⚠️ High-Visibility Warnings

**This library is experimental and comes with important warnings:**

- **No Guarantees**: This library makes no guarantees about bans, detection, or platform compliance. Use at your own risk.
- **User Responsibility**: You are fully responsible for how you use this library and for complying with Instagram's Terms of Service and applicable laws.
- **No Affiliation**: This project is not affiliated with, endorsed by, or connected to Instagram or Meta.
- **No Warranty**: This software is provided "as is", without warranty of any kind.

### Acceptable Use

- ✅ Analytics for accounts you own/manage
- ✅ Monitoring public pages for legitimate purposes
- ✅ Internal dashboards and reporting
- ✅ Research, testing, controlled experimentation

### Unacceptable Use

- ❌ Harassment or stalking
- ❌ Mass surveillance
- ❌ Credential theft
- ❌ Spam or automation actions
- ❌ Any usage intended to harm

**See [docs/](docs/) for full Ethics & Risks documentation.**

## Installation

```bash
npm install ig-scraper
```

## Quick Start

> **Note**: Full documentation is in the [docs/](docs/) directory. This is a minimal example.

```typescript
import { IGScraper } from 'ig-scraper';

const scraper = new IGScraper(session);

const result = await scraper.getProfile({ username: 'example' });

if (result.ok) {
  console.log(result.data.normalized);
} else {
  console.error(result.error);
}

await scraper.close();
```

## Documentation

Full documentation is available in the [`docs/`](docs/) directory:

- [Quick Start](docs/)
- [Session Model](docs/) - How to obtain and store sessions securely
- [API Reference](docs/)
- [Troubleshooting](docs/)
- [Ethics & Risks](docs/) - Important responsibility information

## Current Status (v0)

This is an **experimental v0.x release**. The API may change between versions.

### Supported Features

- Profile extraction (`getProfile`)
- Profile posts list (`listProfilePosts`) with cursor pagination
- Single post details (`getPost`)

### Out of Scope (v0)

- Followers/Following lists
- Automation actions (posting, liking, commenting)

## Requirements

- Node.js >= 20.0.0
- Valid Instagram session (see Session Model docs)

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Type check
npm run typecheck

# Lint
npm run lint

# Format
npm run format
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## Disclaimer

This project is an independent effort and is not associated with Instagram or Meta. Use responsibly and in accordance with Instagram's Terms of Service and applicable laws.
