export function markdownToTerminal(markdownString: string): string {
    const reset = "\x1b[0m";
    const bold = "\x1b[1m";
    const dim = "\x1b[2m";
    const italic = "\x1b[3m"; // Not all terminals support italic
    const underline = "\x1b[4m";
    // const inverse = "\x1b[7m"; // Swap foreground and background - not used
    // const hidden = "\x1b[8m"; // Hidden text - not used
    // const strikethrough = "\x1b[9m"; // Not widely supported - not used
  
    // Foreground colors
    // const black = "\x1b[30m"; // Not used directly for foreground after removal of bg
    const red = "\x1b[31m";
    const green = "\x1b[32m";
    const yellow = "\x1b[33m";
    const blue = "\x1b[34m";
    const magenta = "\x1b[35m";
    const cyan = "\x1b[36m";
    const white = "\x1b[37m";
    const gray = "\x1b[90m"; // Bright black/dark gray
  
    let result = "";
    const lines = markdownString.split("\n");
    let inCodeBlock = false;
    // let inBlockquote = false; // Blockquote styling is applied per line
  
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trimEnd();
  
      // Handle fenced code blocks
      if (line.startsWith("```")) {
        inCodeBlock = !inCodeBlock;
        // For a clear visual, just a newline when toggling the code block,
        // or perhaps a dim separator. I'll just use a newline.
        result += "\n";
        continue;
      }
  
      if (inCodeBlock) {
        // No background color, just indent and potentially a foreground color
        result += `${dim}${white}  ${line}${reset}\n`; // Dim white for code
        continue;
      }
  
      // Handle blockquotes
      if (line.startsWith(">")) {
        line = line.substring(1).trimStart();
        result += `${gray}${dim}| ${line}${reset}\n`; // Gray and dim for blockquotes
        continue;
      }
  
      // Get terminal columns for horizontal rule
      const { columns } = Deno.consoleSize();
  
      // Horizontal Rule
      if (line.match(/^-{3,}$/) || line.match(/^\*{3,}$/) || line.match(/^__{3,}$/)) {
        result += `${dim}${underline}${"-".repeat(columns || 80)}${reset}\n`;
        continue;
      }
  
      // Headings
      if (line.startsWith("# ")) {
        result += `${bold}${cyan}${underline}${line.substring(2)}${reset}\n\n`;
        continue;
      }
      if (line.startsWith("## ")) {
        result += `${bold}${blue}${line.substring(3)}${reset}\n\n`;
        continue;
      }
      if (line.startsWith("### ")) {
        result += `${bold}${green}${line.substring(4)}${reset}\n\n`;
        continue;
      }
      if (line.startsWith("#### ")) {
        result += `${bold}${magenta}${line.substring(5)}${reset}\n\n`;
        continue;
      }
      if (line.startsWith("##### ")) {
        result += `${bold}${yellow}${line.substring(6)}${reset}\n\n`;
        continue;
      }
      if (line.startsWith("###### ")) {
        result += `${dim}${bold}${white}${line.substring(7)}${reset}\n\n`;
        continue;
      }
  
      // Unordered Lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        result += `  ${yellow}*${reset} ${line.substring(2)}\n`;
        continue;
      }
  
      // Ordered Lists
      const orderedListMatch = line.match(/^(\d+)\.\s+/);
      if (orderedListMatch) {
        const num = orderedListMatch[1];
        result += `  ${green}${num}.${reset} ${line.substring(orderedListMatch[0].length)}\n`;
        continue;
      }
  
      // Process inline markdown for the current line
      let processedLine = line;
  
      // Bold/Strong: **text** or __text__
      processedLine = processedLine.replace(
        /(\*\*|__)(.*?)\1/g,
        `${bold}$2${reset}${reset}`, // Reset twice to clear any previous styles
      );
  
      // Italic/Emphasis: *text* or _text_
      // Make sure not to match _ if it's part of a word or internal to a word like in `file_name`
      processedLine = processedLine.replace(
        /(?<!\w)(_|\*)([^\s].*?)\1(?!\w)/g,
        `${italic}$2${reset}`,
      );
  
      // Inline Code: `code`
      // Using a different color for inline code without a background
      processedLine = processedLine.replace(/`([^`]+)`/g, `${yellow}$1${reset}`);
  
      // Links: [text](url)
      processedLine = processedLine.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        `${underline}${blue}$1${reset}${gray} (${italic}$2${reset}${gray})${reset}`,
      );
  
      // Add the processed line
      if (processedLine) {
        result += `${processedLine}\n`;
      }
    }
  
    return result;
  }