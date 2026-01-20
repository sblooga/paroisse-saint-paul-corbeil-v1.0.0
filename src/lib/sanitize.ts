import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Allows safe HTML tags for rich content while blocking scripts
 */
export const sanitizeHtml = (html: string): string => {
  const decodeHtml = (input: string) => {
    if (typeof window === 'undefined') return input;
    const txt = window.document.createElement('textarea');
    txt.innerHTML = input;
    return txt.value;
  };

  const decoded = decodeHtml(html);

  return DOMPurify.sanitize(decoded, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'br', 'span', 'div', 'blockquote', 'img', 'iframe'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'class', 'style', 'title', 'allow', 'loading', 'frameborder', 'allowfullscreen'],
    ALLOW_DATA_ATTR: false,
  });
};
