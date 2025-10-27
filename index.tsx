document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/public/content.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const content = await response.json();
    populateContent(content);
  } catch (error) {
    console.error("Could not load site content:", error);
    // You could display an error message to the user here
  }
});

function populateContent(content: any) {
  // Simple text/attribute population
  document.querySelectorAll('[data-content]').forEach(el => {
    const key = el.getAttribute('data-content');
    const value = getNestedValue(content, key);
    if (value) {
      if (key?.includes('cta_button')) {
          el.textContent = value.text;
          (el as HTMLAnchorElement).href = value.url;
      } else {
          el.textContent = value;
      }
    }
  });

  // Populate innerHTML
  document.querySelectorAll('[data-content-html]').forEach(el => {
    const key = el.getAttribute('data-content-html');
    let value = getNestedValue(content, key);
    if(key === 'contact.direct_link_text') {
        value = value.replace('{calendly_url}', content.contact.calendly_url);
    }
    if (value) {
      el.innerHTML = value;
    }
  });

  // Populate hrefs
  document.querySelectorAll('[data-content-href]').forEach(el => {
    const key = el.getAttribute('data-content-href');
    const value = getNestedValue(content, key);
    if (value) {
      (el as HTMLAnchorElement).href = value;
    }
  });

  // Populate background images
  document.querySelectorAll('[data-content-style]').forEach(el => {
    const key = el.getAttribute('data-content-style');
    const value = getNestedValue(content, key);
    if (value) {
      (el as HTMLElement).style.backgroundImage = `url('${value}')`;
    }
  });

    // Populate image sources and alt text
  document.querySelectorAll('[data-content-img]').forEach(el => {
    const key = el.getAttribute('data-content-img');
    const imageData = getNestedValue(content, key);
    if (imageData) {
      (el as HTMLImageElement).src = imageData.url || imageData; // Support simple string or object with url
      (el as HTMLImageElement).alt = imageData.alt || '';
    }
  });

  // Populate lists
  populateNavigation(content.navigation);
  populateList('services.items', content.services.items, createServiceElement);
  populateList('testimonials.items', content.testimonials.items, createTestimonialElement);
  populateList('blog.posts', content.blog.posts, createBlogPostElement);

  // Re-add mobile nav link listeners after creation
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const closeMenu = () => {
      if (mobileMenu) {
          mobileMenu.classList.remove('open');
          mobileMenuButton?.setAttribute('aria-expanded', 'false');
      }
  };
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeMenu);
  });
}

function getNestedValue(obj: any, path: string | null) {
  if (!path) return null;
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

function populateNavigation(navItems: { label: string, href: string }[]) {
    const desktopNav = document.querySelector('[data-content="navigation.desktop"]');
    const mobileNav = document.querySelector('[data-content="navigation.mobile"]');
    if (!desktopNav || !mobileNav) return;

    desktopNav.innerHTML = '';
    mobileNav.innerHTML = '';
    
    navItems.forEach(item => {
        // Desktop
        const liDesktop = document.createElement('li');
        liDesktop.innerHTML = `<a href="${item.href}" class="text-base text-[#37474F] hover:text-[#E57373] transition-colors">${item.label}</a>`;
        desktopNav.appendChild(liDesktop);

        // Mobile
        const liMobile = document.createElement('li');
        liMobile.innerHTML = `<a href="${item.href}" class="mobile-nav-link text-lg text-[#37474F] hover:text-[#E57373]">${item.label}</a>`;
        mobileNav.appendChild(liMobile);
    });
}

function populateList(key: string, items: any[], createElementFunc: (item: any) => HTMLElement) {
  const container = document.querySelector(`[data-content-list="${key}"]`);
  if (!container || !items) return;
  container.innerHTML = '';
  items.forEach(item => {
    container.appendChild(createElementFunc(item));
  });
}

function createServiceElement(item: any): HTMLElement {
  const div = document.createElement('div');
  div.className = 'bg-white p-8 rounded-lg shadow-lg text-center transform hover:-translate-y-2 transition-transform duration-300';
  div.innerHTML = `
    <div class="bg-[#4DB6AC] text-white rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon_svg_path}" />
      </svg>
    </div>
    <h3 class="text-xl font-bold mb-3">${item.title}</h3>
    <p class="leading-normal">${item.description}</p>
  `;
  return div;
}

function createTestimonialElement(item: any): HTMLElement {
  const div = document.createElement('div');
  div.className = 'bg-[#FFF8E1] p-8 rounded-lg shadow-xl border-l-4 border-[#FFD54F]';
  div.innerHTML = `
    <p class="text-[#37474F] italic mb-6 leading-normal">${item.quote}</p>
    <p class="font-bold text-[#4DB6AC] text-right">${item.author}</p>
  `;
  return div;
}

function createBlogPostElement(item: any): HTMLElement {
    const div = document.createElement('div');
    div.className = 'bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300';
    div.innerHTML = `
        <img src="${item.image_url}" alt="${item.image_alt}" class="w-full h-48 object-cover" loading="lazy" />
        <div class="p-6">
            <h3 class="text-xl font-bold mb-3">${item.title}</h3>
            <p class="leading-normal mb-4">${item.excerpt}</p>
            <a href="${item.link_url}" target="_blank" rel="noopener noreferrer" class="font-bold text-[#E57373] hover:text-[#D32F2F]">${item.link_text}</a>
        </div>
    `;
    return div;
}