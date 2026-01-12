export default function decorate(block) {
  // Extract text from the first row/cell
  const titleText = block.querySelector(':scope > div > div')?.textContent.trim();

  // Extract type (h1/h2) from the second row/cell
  const typeRow = block.querySelector(':scope > div:nth-child(2) > div');
  const type = typeRow ? typeRow.textContent.trim().toLowerCase() : 'h2';

  if (titleText) {
    const header = document.createElement(type);
    header.textContent = titleText;

    // Clear the block and append the new header
    block.textContent = '';
    block.append(header);
  }
}