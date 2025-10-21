import { normalizeArabicText, countOccurrences, containsArabicWord } from './arabicUtils';
import type { PrimaryKeywordAnalysis, SubKeywordAnalysis, CompanyNameAnalysis } from '@shared/schema';

export function stripHTML(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

export function getWordCount(text: string): number {
  const cleanText = text.trim();
  if (!cleanText) return 0;
  return cleanText.split(/\s+/).length;
}

export function analyzePrimaryKeyword(
  content: string,
  keyword: string
): PrimaryKeywordAnalysis {
  const plainText = stripHTML(content);
  const wordCount = getWordCount(plainText);
  
  // Create a temporary div to parse HTML
  const div = document.createElement('div');
  div.innerHTML = content;
  
  // Get all paragraphs and headings
  const paragraphs = Array.from(div.querySelectorAll('p')).filter(p => p.textContent?.trim());
  const headings = Array.from(div.querySelectorAll('h1, h2, h3, h4, h5, h6')).filter(h => h.textContent?.trim());
  
  // Check conditions
  const firstParagraph = paragraphs[0]?.textContent || '';
  const lastParagraph = paragraphs[paragraphs.length - 1]?.textContent || '';
  const firstHeading = headings[0]?.textContent || '';
  const lastHeading = headings[headings.length - 1]?.textContent || '';
  
  const inFirstParagraph = containsArabicWord(firstParagraph, keyword);
  const inFirstHeading = containsArabicWord(firstHeading, keyword);
  const inLastHeading = containsArabicWord(lastHeading, keyword);
  const inLastParagraph = containsArabicWord(lastParagraph, keyword);
  
  // Count occurrences
  const currentCount = countOccurrences(plainText, keyword);
  const currentPercentage = wordCount > 0 ? (currentCount / wordCount) * 100 : 0;
  
  // Target: 0.7-0.9%
  const targetPercentage = { min: 0.7, max: 0.9 };
  const targetCount = {
    min: Math.ceil((wordCount * targetPercentage.min) / 100),
    max: Math.ceil((wordCount * targetPercentage.max) / 100)
  };
  
  return {
    keyword,
    inFirstParagraph,
    inFirstHeading,
    inLastHeading,
    inLastParagraph,
    currentCount,
    currentPercentage,
    targetPercentage,
    targetCount
  };
}

export function analyzeSubKeyword(
  content: string,
  keyword: string
): SubKeywordAnalysis {
  const plainText = stripHTML(content);
  const wordCount = getWordCount(plainText);
  
  // Create a temporary div to parse HTML
  const div = document.createElement('div');
  div.innerHTML = content;
  
  // Get all H2 headings
  const h2Headings = Array.from(div.querySelectorAll('h2'));
  
  // Find H2 headings containing the keyword
  const h2HeadingsContaining = h2Headings
    .filter(h2 => containsArabicWord(h2.textContent || '', keyword))
    .map(h2 => h2.textContent || '');
  
  const inH2Heading = h2HeadingsContaining.length > 0;
  
  // Check if keyword exists in paragraphs following any of these H2s
  let inSameH2Paragraph = false;
  
  for (const h2 of h2Headings) {
    if (containsArabicWord(h2.textContent || '', keyword)) {
      // Find the next paragraph after this H2
      let nextElement = h2.nextElementSibling;
      while (nextElement) {
        if (nextElement.tagName === 'P') {
          if (containsArabicWord(nextElement.textContent || '', keyword)) {
            inSameH2Paragraph = true;
            break;
          }
          break; // Only check the first paragraph after H2
        }
        // If we hit another heading, stop looking
        if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(nextElement.tagName)) {
          break;
        }
        nextElement = nextElement.nextElementSibling;
      }
      if (inSameH2Paragraph) break;
    }
  }
  
  // Count occurrences
  const currentCount = countOccurrences(plainText, keyword);
  const currentPercentage = wordCount > 0 ? (currentCount / wordCount) * 100 : 0;
  
  // Target: 0.1-0.2%
  const targetPercentage = { min: 0.1, max: 0.2 };
  const targetCount = {
    min: Math.ceil((wordCount * targetPercentage.min) / 100),
    max: Math.ceil((wordCount * targetPercentage.max) / 100)
  };
  
  return {
    keyword,
    inH2Heading,
    inSameH2Paragraph,
    h2HeadingsContaining,
    currentCount,
    currentPercentage,
    targetPercentage,
    targetCount
  };
}

export function analyzeCompanyName(
  content: string,
  name: string
): CompanyNameAnalysis {
  const plainText = stripHTML(content);
  const wordCount = getWordCount(plainText);
  
  // Count occurrences
  const currentCount = countOccurrences(plainText, name);
  const currentPercentage = wordCount > 0 ? (currentCount / wordCount) * 100 : 0;
  
  // Target: 0.1-0.2%
  const targetPercentage = { min: 0.1, max: 0.2 };
  const targetCount = {
    min: Math.ceil((wordCount * targetPercentage.min) / 100),
    max: Math.ceil((wordCount * targetPercentage.max) / 100)
  };
  
  return {
    name,
    currentCount,
    currentPercentage,
    targetPercentage,
    targetCount
  };
}
