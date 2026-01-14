// blocks/header/header.js

/**
 * RevMed Clinical Trials - Header Block
 * Supports Universal Editor with dropdown hover navigation
 */

/**
 * Loads a fragment from the specified path
 * @param {string} path The path to the fragment
 * @returns {HTMLElement} The root element of the fragment
 */
async function loadFragment(path) {
  if (path && path.startsWith('/')) {
    const resp = await fetch(`${path}.plain.html`);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      // Decorate blocks in the fragment
      const { decorateBlocks, loadBlocks } = await import('../scripts.js');
      decorateBlocks(main);
      await loadBlocks(main);

      return main;
    }
  }
  return null;
}

/**
 * Decorates the header block
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // Load nav content from fragment
  const navMeta = block.querySelector('a[href*="/nav"]');
  const navPath = navMeta ? new URL(navMeta.href).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // Clear the block
  block.textContent = '';

  if (!fragment) {
    return;
  }

  // Build header structure
  const nav = document.createElement('nav');
  nav.className = 'header-nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // Expected structure in nav fragment:
  // Row 1: Logo
  // Row 2: Navigation links
  // Row 3: CTA button (Contact Us)

  const sections = fragment.querySelectorAll(':scope > div');

  if (sections.length >= 3) {
    // Logo section
    const logoSection = sections[0];
    const logo = logoSection.querySelector('picture, img');
    if (logo) {
      const logoLink = document.createElement('a');
      logoLink.href = '/';
      logoLink.className = 'header-logo';
      logoLink.setAttribute('aria-label', 'Revolution Medicines Home');
      logoLink.appendChild(logo.cloneNode(true));
      nav.appendChild(logoLink);
    }

    // Navigation menu
    const navSection = sections[1];
    const navLinks = navSection.querySelectorAll('a');

    if (navLinks.length > 0) {
      const navList = document.createElement('ul');
      navList.className = 'header-menu';
      navList.setAttribute('role', 'menubar');

      navLinks.forEach((link) => {
        const li = document.createElement('li');
        li.className = 'header-menu-item';
        li.setAttribute('role', 'none');

        const menuLink = link.cloneNode(true);
        menuLink.setAttribute('role', 'menuitem');

        // Check if this is a parent item that should have a dropdown
        // For RevMed, "Clinical Trials" might have sub-items
        const linkText = menuLink.textContent.trim();

        // Add dropdown indicator for items that might have submenus
        if (linkText === 'Clinical Trials') {
          menuLink.classList.add('has-dropdown');

          // Create dropdown menu
          const dropdown = document.createElement('ul');
          dropdown.className = 'header-dropdown';
          dropdown.setAttribute('role', 'menu');
          dropdown.setAttribute('aria-label', `${linkText} submenu`);

          // Add dropdown items - these would come from your content
          // For now, adding placeholder structure
          const dropdownItems = [
            { text: 'All Clinical Trials', href: '/clinical-trials' },
            { text: 'NSCLC Trials', href: '/clinical-trials#nsclc' },
            { text: 'PDAC Trials', href: '/clinical-trials#pdac' },
            { text: 'CRC Trials', href: '/clinical-trials#crc' }
          ];

          dropdownItems.forEach((item) => {
            const dropdownLi = document.createElement('li');
            dropdownLi.setAttribute('role', 'none');

            const dropdownLink = document.createElement('a');
            dropdownLink.href = item.href;
            dropdownLink.textContent = item.text;
            dropdownLink.setAttribute('role', 'menuitem');

            dropdownLi.appendChild(dropdownLink);
            dropdown.appendChild(dropdownLi);
          });

          li.appendChild(menuLink);
          li.appendChild(dropdown);
        } else {
          li.appendChild(menuLink);
        }

        navList.appendChild(li);
      });

      nav.appendChild(navList);
    }

    // CTA button (Contact Us)
    const ctaSection = sections[2];
    const ctaLink = ctaSection.querySelector('a');
    if (ctaLink) {
      const ctaButton = ctaLink.cloneNode(true);
      ctaButton.className = 'header-cta';
      nav.appendChild(ctaButton);
    }
  }

  // Mobile menu toggle
  const hamburger = document.createElement('button');
  hamburger.className = 'header-hamburger';
  hamburger.setAttribute('aria-label', 'Open navigation menu');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.innerHTML = `
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
  `;

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !expanded);
    nav.classList.toggle('is-open');
    hamburger.classList.toggle('is-active');

    // Prevent body scroll when menu is open
    document.body.style.overflow = expanded ? '' : 'hidden';
  });

  nav.insertBefore(hamburger, nav.querySelector('.header-menu'));

  // Handle dropdown interactions
  const dropdownItems = nav.querySelectorAll('.has-dropdown');

  dropdownItems.forEach((item) => {
    const link = item.querySelector('a');
    const dropdown = item.querySelector('.header-dropdown');

    // Hover events for desktop
    item.addEventListener('mouseenter', () => {
      item.classList.add('is-active');
      dropdown.classList.add('is-visible');
    });

    item.addEventListener('mouseleave', () => {
      item.classList.remove('is-active');
      dropdown.classList.remove('is-visible');
    });

    // Click/touch events for mobile
    link.addEventListener('click', (e) => {
      if (window.innerWidth < 1024) {
        e.preventDefault();
        const isActive = item.classList.contains('is-active');

        // Close all other dropdowns
        dropdownItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove('is-active');
            otherItem.querySelector('.header-dropdown')?.classList.remove('is-visible');
          }
        });

        // Toggle current dropdown
        item.classList.toggle('is-active', !isActive);
        dropdown.classList.toggle('is-visible', !isActive);
      }
    });

    // Keyboard navigation
    link.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        item.classList.add('is-active');
        dropdown.classList.add('is-visible');
        dropdown.querySelector('a')?.focus();
      }
    });

    // Allow escape to close dropdown
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        item.classList.remove('is-active');
        dropdown.classList.remove('is-visible');
        link.focus();
      }
    });
  });

  // Sticky header on scroll
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      block.classList.add('is-sticky');

      // Hide on scroll down, show on scroll up
      if (currentScroll > lastScroll && currentScroll > 300) {
        block.classList.add('is-hidden');
      } else {
        block.classList.remove('is-hidden');
      }
    } else {
      block.classList.remove('is-sticky');
      block.classList.remove('is-hidden');
    }

    lastScroll = currentScroll;
  });

  block.appendChild(nav);

  // Close mobile menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024) {
      nav.classList.remove('is-open');
      hamburger.classList.remove('is-active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}