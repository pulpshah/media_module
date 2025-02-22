import { useState, useEffect } from "react";

interface PageData {
  url: string;
  title: string;
  structuredText: Array<{ text: string | undefined; path: string }>;
  links: Array<{ text: string; url: string; path: string }>;
  buttons: Array<{ text: string; action: string; path: string }>;
  images: Array<{
    src: string;
    alt: string;
    width: number;
    height: number;
    path: string;
  }>;
}

const getElementPath = (element: HTMLElement): string => {
  const parts = [];
  while (element && element.tagName.toLowerCase() !== "html") {
    let tag = element.tagName.toLowerCase();
    if (element.id) {
      tag += `#${element.id}`;
    } else if (element.classList.length > 0) {
      const firstClass = Array.from(element.classList).find(
        (cls) => !cls.startsWith("__variable_")
      );
      if (firstClass) tag += `.${firstClass}`;
    }
    parts.unshift(tag);
    element = element.parentElement as HTMLElement;
  }
  return parts.join(" > ");
};

export const usePageData = () => {
  const [pageData, setPageData] = useState<PageData>({
    url: "",
    title: "",
    structuredText: [],
    links: [],
    buttons: [],
    images: [],
  });

  useEffect(() => {
    const extractPageData = () => {
      const extractedTexts = new Set<string>();
      const buttonTexts = new Set<string>();

      // Process buttons first
      const buttons = Array.from(
        document.querySelectorAll(
          "button, input[type='submit'], [role='button']"
        )
      )
        .map((button) => {
          const text = (
            (button as HTMLElement).innerText.trim() ||
            button.getAttribute("value") ||
            "No text"
          ).replace(/\s+/g, " ");
          buttonTexts.add(text);
          return {
            text,
            action: button.getAttribute("onclick") || "No direct action",
            path: getElementPath(button as HTMLElement),
          };
        })
        .filter((button) => button.text !== "No text");

      // Process structured text with depth-first leaf node extraction
      const structuredText = Array.from(
        document.body.querySelectorAll(
          "h1, h2, h3, h4, h5, h6, p, label, li, strong, em, span, div, td, th, blockquote, pre, code"
        )
      )
        .flatMap((el) => {
          const results: Array<{ text: string; path: string }> = [];

          const traverse = (element: Element) => {
            // Skip elements already processed as buttons
            if (
              element.matches('button, input[type="submit"], [role="button"]')
            )
              return;

            // Capture direct text nodes regardless of children
            const directText = Array.from(element.childNodes)
              .filter(
                (node) =>
                  node.nodeType === Node.TEXT_NODE &&
                  node.textContent?.trim() &&
                  !buttonTexts.has(node.textContent.trim())
              )
              .map((node) => node.textContent?.trim().replace(/\s+/g, " "))
              .join(" ")
              .trim();

            if (directText && !extractedTexts.has(directText)) {
              extractedTexts.add(directText);
              results.push({
                text: directText,
                path: getElementPath(element as HTMLElement),
              });
            }

            // Continue depth-first traversal
            Array.from(element.children).forEach(traverse);
          };

          traverse(el);
          return results;
        })
        .filter(
          (entry, index, arr) =>
            !arr.some(
              (e, i) =>
                i < index &&
                e.path.startsWith(entry.path) &&
                e.text.includes(entry.text)
            )
        );

      const links = Array.from(document.querySelectorAll("a[href]")).map(
        (link) => ({
          text: (link as HTMLAnchorElement).innerText.trim(),
          url: (link as HTMLAnchorElement).href,
          path: getElementPath(link as HTMLElement),
        })
      );

      const images = Array.from(document.querySelectorAll("img")).map(
        (img) => ({
          src: img.src,
          alt: img.alt || "No alt text",
          width: img.width,
          height: img.height,
          path: getElementPath(img),
        })
      );

      setPageData({
        url: window.location.href,
        title: document.title,
        structuredText,
        links,
        buttons,
        images,
      });
      // console.log("Updated Page Data:", {
      //   url: window.location.href,
      //   title: document.title,
      //   structuredText,
      //   links,
      //   buttons,
      //   images,
      // });
    };

    extractPageData();

    const observer = new MutationObserver(() => extractPageData());
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: false,
    });

    return () => observer.disconnect();
  }, []);

  return pageData;
};
