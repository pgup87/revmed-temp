export default function decorate(block) {
  // EDS automatically wraps content in divs. We extract the text and type.
  const rows = [...block.children];
  const titleText = rows[0]?.textContent.trim();
  const type = rows[1]?.textContent.trim() || 'h2'; // Default to h2

  // Create the semantic heading element
  const header = document.createElement(type);
  header.textContent = titleText;
  
  // Clear the block and append the new header
  block.textContent = '';
  block.append(header);
}