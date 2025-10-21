export function normalizeArabicText(text: string): string {
  return text
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ؤ]/g, 'و')
    .replace(/[ئ]/g, 'ي')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .toLowerCase();
}

export function normalizeForAnalysis(text: string): string {
  return text
    .toLowerCase()
    // Remove all punctuation marks (both Arabic and English)
    .replace(/[.,،؛;:!?؟\-_'"""()[\]{}\/\\|]/g, ' ')
    // Remove all non-Arabic characters except spaces
    .replace(/[^\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findAllOccurrences(text: string, searchTerm: string): Array<{start: number, end: number, text: string}> {
  const normalizedText = normalizeArabicText(text);
  const normalizedSearch = normalizeArabicText(searchTerm);
  const occurrences: Array<{start: number, end: number, text: string}> = [];
  
  // Remove punctuation from search term for matching
  const cleanSearchTerm = normalizedSearch.replace(/[.,،؛;:!?؟\-_'"""()[\]{}\/\\|]/g, ' ').trim();
  const searchWords = cleanSearchTerm.split(/\s+/).filter(w => w.length > 0);
  
  if (searchWords.length > 1) {
    // For multi-word phrases, split text by both spaces and punctuation
    // Find all occurrences where the words appear in sequence
    const textSegments = text.split(/[\s.,،؛;:!?؟\-_'"""()[\]{}\/\\|]+/);
    const normalizedSegments = textSegments.map(seg => normalizeArabicText(seg));
    
    // Look for sequences of words that match
    for (let i = 0; i <= normalizedSegments.length - searchWords.length; i++) {
      let allMatch = true;
      for (let j = 0; j < searchWords.length; j++) {
        if (normalizedSegments[i + j] !== searchWords[j]) {
          allMatch = false;
          break;
        }
      }
      
      if (allMatch) {
        // Find the actual position in original text
        let startPos = 0;
        for (let k = 0; k < i; k++) {
          startPos = text.indexOf(textSegments[k], startPos) + textSegments[k].length;
        }
        startPos = text.indexOf(textSegments[i], startPos);
        
        // Find end position
        let endPos = startPos;
        for (let k = 0; k < searchWords.length; k++) {
          endPos = text.indexOf(textSegments[i + k], endPos) + textSegments[i + k].length;
        }
        
        occurrences.push({
          start: startPos,
          end: endPos,
          text: text.substring(startPos, endPos)
        });
      }
    }
  } else {
    // For single word, split text by spaces and punctuation
    const textSegments = text.split(/[\s.,،؛;:!?؟\-_'"""()[\]{}\/\\|]+/);
    const normalizedSegments = textSegments.map(seg => normalizeArabicText(seg));
    
    // Find all matches
    let currentIndex = 0;
    for (let i = 0; i < normalizedSegments.length; i++) {
      if (normalizedSegments[i] === cleanSearchTerm) {
        // Find the actual position in original text
        const segmentPos = text.indexOf(textSegments[i], currentIndex);
        occurrences.push({
          start: segmentPos,
          end: segmentPos + textSegments[i].length,
          text: textSegments[i]
        });
        currentIndex = segmentPos + textSegments[i].length;
      } else {
        currentIndex = text.indexOf(textSegments[i], currentIndex) + textSegments[i].length;
      }
    }
  }
  
  return occurrences;
}

export function containsArabicWord(text: string, word: string): boolean {
  const normalizedText = normalizeArabicText(text);
  const normalizedWord = normalizeArabicText(word);
  
  // Remove all punctuation from both text and search term
  const cleanText = normalizedText.replace(/[.,،؛;:!?؟\-_'"""()[\]{}\/\\|]/g, ' ');
  const cleanWord = normalizedWord.replace(/[.,،؛;:!?؟\-_'"""()[\]{}\/\\|]/g, ' ').trim();
  
  // Use word boundary matching to find whole words only
  // Split both text and word into words and check if any word matches
  const textWords = cleanText.split(/\s+/).filter(w => w.length > 0);
  const searchWords = cleanWord.split(/\s+/).filter(w => w.length > 0);
  
  // For multi-word search terms, use sliding window to check exact sequence match
  if (searchWords.length > 1) {
    for (let i = 0; i <= textWords.length - searchWords.length; i++) {
      let allMatch = true;
      for (let j = 0; j < searchWords.length; j++) {
        if (textWords[i + j] !== searchWords[j]) {
          allMatch = false;
          break;
        }
      }
      if (allMatch) return true;
    }
    return false;
  }
  
  // For single word, check exact word match
  return textWords.some(w => w === cleanWord);
}

export function countOccurrences(text: string, searchTerm: string): number {
  return findAllOccurrences(text, searchTerm).length;
}
