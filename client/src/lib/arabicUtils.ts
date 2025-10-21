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
  
  // Check if search term is multi-word
  const searchWords = normalizedSearch.split(/\s+/);
  
  if (searchWords.length > 1) {
    // For multi-word phrases, use substring matching
    let index = 0;
    while (index < normalizedText.length) {
      const foundIndex = normalizedText.indexOf(normalizedSearch, index);
      if (foundIndex === -1) break;
      
      occurrences.push({
        start: foundIndex,
        end: foundIndex + searchTerm.length,
        text: text.substring(foundIndex, foundIndex + searchTerm.length)
      });
      
      index = foundIndex + 1;
    }
  } else {
    // For single word, find exact word matches using word boundaries
    const words = text.split(/\s+/);
    let currentIndex = 0;
    
    for (const word of words) {
      const normalizedWord = normalizeArabicText(word);
      if (normalizedWord === normalizedSearch) {
        occurrences.push({
          start: currentIndex,
          end: currentIndex + word.length,
          text: word
        });
      }
      currentIndex += word.length + 1; // +1 for space
    }
  }
  
  return occurrences;
}

export function containsArabicWord(text: string, word: string): boolean {
  const normalizedText = normalizeArabicText(text);
  const normalizedWord = normalizeArabicText(word);
  
  // Use word boundary matching to find whole words only
  // Split both text and word into words and check if any word matches
  const textWords = normalizedText.split(/\s+/);
  const searchWords = normalizedWord.split(/\s+/);
  
  // For multi-word search terms, check if all words appear in sequence
  if (searchWords.length > 1) {
    const searchPhrase = searchWords.join(' ');
    return normalizedText.includes(searchPhrase);
  }
  
  // For single word, check exact word match
  return textWords.some(w => w === normalizedWord);
}

export function countOccurrences(text: string, searchTerm: string): number {
  return findAllOccurrences(text, searchTerm).length;
}
