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
    .replace(/[^\u0600-\u06FF\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findAllOccurrences(text: string, searchTerm: string): Array<{start: number, end: number, text: string}> {
  const normalizedText = normalizeArabicText(text);
  const normalizedSearch = normalizeArabicText(searchTerm);
  const occurrences: Array<{start: number, end: number, text: string}> = [];
  
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
  
  return occurrences;
}

export function containsArabicWord(text: string, word: string): boolean {
  const normalizedText = normalizeArabicText(text);
  const normalizedWord = normalizeArabicText(word);
  return normalizedText.includes(normalizedWord);
}

export function countOccurrences(text: string, searchTerm: string): number {
  return findAllOccurrences(text, searchTerm).length;
}
