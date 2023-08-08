import { Button, InlineKeyboard } from "./interfaces";

export function getInlineKeyboard(buttons: Button[]): InlineKeyboard[] {
  let inlineKeyboard: InlineKeyboard[] = [];
  for(const chunkButtons of chunk(buttons, 3)) {
    inlineKeyboard.push({
      inline_keyboard: [[ ...chunkButtons ]],
      resize_keyboard: true
    });
  }
  return inlineKeyboard;
}

export function chunk(array, size = 1): any[] {
    const length = array == null ? 0 : array.length;
    if (!length || size < 1) {
      return [];
    }
    let index = 0;
    let resIndex = 0;
    const result = new Array(Math.ceil(length / size));
  
    while (index < length) {
      result[resIndex++] = array.slice(index, (index += size));
    }
    return result;
}
