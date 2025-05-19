# Website Text Extractor

A Node.js module using Puppeteer to scrape all text content from a given website URL.

## Prerequisites

- Node.js and npm installed.

## Setup

1. Navigate to this directory (`website-text-extractor`).
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

To run the scraper, use the following command:

```bash
node extractText.js <URL>
```

Replace `<URL>` with the full URL of the website you want to scrape (e.g., `https://example.com`).

Example:
```bash
node extractText.js https://example.com
```

The extracted text will be printed to the console.
