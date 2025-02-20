"use client";
import { useEffect, useState } from "react";

const SmartCursor = () => {
  const [pageData, setPageData] = useState({
    url: "",
    title: "",
    structuredText: [],
    links: [],
    buttons: [],
    images: [],
  });

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const extractPageData = () => {
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

      const extractedTexts = new Set();

      const structuredText = Array.from(
        document.body.querySelectorAll(
          "h1, h2, h3, h4, h5, h6, p, label, li, strong, em, span, div, td, th, blockquote, pre, code"
        )
      )
        .filter((el) => {
          const text = el.textContent?.trim();
          if (!text || extractedTexts.has(text)) return false;
          extractedTexts.add(text);
          return true;
        })
        .map((el) => ({
          text: el.textContent?.trim(),
          path: getElementPath((el as HTMLAnchorElement)),
        }));

      const links = Array.from(document.querySelectorAll("a[href]")).map((link) => ({
        text: (link as HTMLAnchorElement).innerText.trim(),
        url: (link as HTMLAnchorElement).href,
        path: getElementPath(link as HTMLAnchorElement),
      }));

      const buttons = Array.from(
        document.querySelectorAll("button, input[type='submit'], [role='button']")
      )
        .filter((button) => {
          const text =
            (button as HTMLAnchorElement).innerText.trim() ||
            button.getAttribute("value") ||
            "No text";
          if (!text || extractedTexts.has(text)) return false;
          extractedTexts.add(text);
          return true;
        })
        .map((button) => ({
          text:
            (button as HTMLAnchorElement).innerText.trim() ||
            button.getAttribute("value") ||
            "No text",
          action: button.getAttribute("onclick") || "No direct action",
          path: getElementPath(button as HTMLAnchorElement),
        }));

      const images = Array.from(document.querySelectorAll("img")).map((img) => ({
        src: img.src,
        alt: img.alt || "No alt text",
        width: img.width,
        height: img.height,
        path: getElementPath(img),
      }));

      const extractedData = {
        url: window.location.href,
        title: document.title,
        structuredText,
        links,
        buttons,
        images,
      } as typeof pageData;

      setPageData(extractedData);
      console.log("Updated Page Data:", extractedData);
    };

    extractPageData();

    const observer = new MutationObserver(() => extractPageData());
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const highlightMatches = (query: string) => {
      // Remove previous highlights
      document.querySelectorAll(".highlighted-text").forEach((el) => {
        el.replaceWith(...el.childNodes);
      });

      if (!query.trim()) return;

      const walkDOM = (node: Node) => {
        if (node.nodeType === 3) {
          const parent = node.parentElement;
          if (!parent || parent.classList.contains("highlighted-text")) return;

          const text = node.textContent || "";
          const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");

          if (text.toLowerCase().includes(query.toLowerCase())) {
            const parts = text.split(regex);
            const frag = document.createDocumentFragment();

            parts.forEach((part, index) => {
              if (index % 2 === 1) {
                // Match: Wrap in highlight span
                const span = document.createElement("span");
                span.textContent = part;
                span.style.backgroundColor = "yellow";
                span.style.color = "black";
                span.style.padding = "2px";
                span.className = "highlighted-text";
                frag.appendChild(span);
              } else {
                // Normal text
                frag.appendChild(document.createTextNode(part));
              }
            });

            parent.replaceChild(frag, node);
          }
        } else {
          node.childNodes.forEach(walkDOM);
        }
      };

      document.body.childNodes.forEach(walkDOM);
    };

    highlightMatches(searchQuery);
  }, [searchQuery]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "10px",
        background: "rgba(0, 0, 0, 0.8)",
        color: "white",
        borderRadius: "8px",
        fontSize: "14px",
        zIndex: 9999,
      }}
    >
      <input
        type="text"
        placeholder="Search & highlight..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{
          width: "180px",
          padding: "5px",
          marginBottom: "8px",
          borderRadius: "4px",
          border: "1px solid white",
          background: "white",
          color: "black",
        }}
      />
      <br />
      Smart Cursor Active
    </div>
  );
};

export default SmartCursor;
