import axios from 'axios';
import * as cheerio from 'cheerio';
import { summarizeText, suggestTags } from './aiService.js';

/**
 * Web Clipper: scrape URL → extract content → AI summarize → suggest tags
 */
export const clipWebPage = async (url) => {
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(html);

    // Remove scripts, styles, nav, footer
    $('script, style, nav, footer, header, aside, iframe, noscript').remove();

    const title = $('title').text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      'Untitled';

    const description =
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') || '';

    // Extract main content
    const contentSelectors = ['article', 'main', '.content', '.post-content', '#content', '.article-body'];
    let content = '';
    for (const selector of contentSelectors) {
      if ($(selector).length) {
        content = $(selector).text().trim();
        break;
      }
    }

    if (!content) {
      content = $('body').text().trim();
    }

    // Clean up whitespace
    content = content.replace(/\s+/g, ' ').slice(0, 5000);

    // AI summarize
    let summary = '';
    try {
      summary = await summarizeText(content);
    } catch (err) {
      summary = description || content.slice(0, 300);
    }

    // AI suggest tags
    let tags = [];
    try {
      tags = await suggestTags(content);
    } catch (err) {
      tags = [];
    }

    return {
      title,
      content: `# ${title}\n\n> Source: ${url}\n\n${summary}\n\n---\n\n${content.slice(0, 3000)}`,
      summary,
      tags,
      sourceUrl: url,
    };
  } catch (error) {
    throw new Error(`Failed to clip web page: ${error.message}`);
  }
};

export default { clipWebPage };
