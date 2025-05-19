const puppeteer = require('puppeteer');

async function extractTextFromUrl(url) {
    if (!url) {
        console.error('Error: URL is required.');
        console.log('Usage: node extractText.js <URL>');
        process.exit(1);
    }

    console.log(`Navigating to ${url}...`);
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true, // Set to false to see the browser UI
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Common args for running in various environments
        });
        const page = await browser.newPage();
        
        // Increase navigation timeout
        await page.setDefaultNavigationTimeout(60000); // 60 seconds

        await page.goto(url, { waitUntil: 'networkidle2' });
        console.log('Page loaded. Extracting text...');

        // Extract text from the body element
        const textContent = await page.evaluate(() => {
            // Try to get text from common main content areas first
            const mainSelectors = ['main', 'article', '.main-content', '.content', '#content'];
            let mainEl = null;
            for (const selector of mainSelectors) {
                mainEl = document.querySelector(selector);
                if (mainEl) break;
            }
            const targetElement = mainEl || document.body;

            // Remove script and style tags to avoid their content
            targetElement.querySelectorAll('script, style, noscript, iframe, svg, header, footer, nav, aside').forEach(el => el.remove());

            // Get text, attempting to preserve some structure with newlines
            let text = '';
            const walker = document.createTreeWalker(targetElement, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walker.nextNode()) {
                const parent = node.parentNode;
                if (parent && parent.nodeName !== 'SCRIPT' && parent.nodeName !== 'STYLE') {
                    let nodeText = node.nodeValue.trim();
                    if (nodeText) {
                        // Check if the parent is a block-level element to decide if a newline is appropriate
                        const parentDisplay = window.getComputedStyle(parent).display;
                        if (['block', 'list-item', 'table-cell', 'table-row'].includes(parentDisplay) && text.length > 0 && !text.endsWith('\n')) {
                            text += '\n';
                        }
                        text += nodeText + ' ';
                    }
                }
            }
            // Normalize whitespace and newlines
            return text.replace(/\s\s+/g, ' ').replace(/ (\n|$) /g, '$1').trim();
        });

        console.log('\n--- Extracted Text ---');
        console.log(textContent);
        console.log('--- End of Extracted Text ---');

    } catch (error) {
        console.error(`Error during scraping: ${error.message}`);
        if (error.message.includes('net::ERR_NAME_NOT_RESOLVED')) {
            console.error(`Could not resolve hostname for URL: ${url}. Please check the URL and your internet connection.`);
        } else if (error.message.includes('TimeoutError')) {
            console.error(`Navigation timeout for URL: ${url}. The page might be too slow to load or inaccessible.`);
        }
        process.exitCode = 1; // Indicate an error occurred
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed.');
        }
    }
}

// Get URL from command line arguments
const url = process.argv[2];

extractTextFromUrl(url);
