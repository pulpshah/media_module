import { useCallback } from "react";

export const useTextHighlighter = () => {
  const highlightMatches = useCallback((query: string) => {
    // Remove previous highlights
    document.querySelectorAll(".highlighted-text").forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        // Remove the tooltip if present
        const tooltip = el.querySelector("div");
        if (tooltip) tooltip.remove();

        // Replace the highlighted text with its original content
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
        parent.normalize(); // Merge adjacent text nodes
      }
    });

    if (!query.trim()) return;

    const walkDOM = (node: Node) => {
      if (node.nodeType === 3) {
        // Text node
        const parent = node.parentElement;
        if (!parent || parent.classList.contains("highlighted-text")) return;

        const text = node.textContent || "";
        const searchText = query.toLowerCase();
        const textLower = text.toLowerCase();
        let currentIndex = 0;
        const frag = document.createDocumentFragment();

        while (true) {
          const index = textLower.indexOf(searchText, currentIndex);
          if (index === -1) break;

          // Add text before match
          if (index > currentIndex) {
            frag.appendChild(
              document.createTextNode(text.substring(currentIndex, index))
            );
          }

          // Add highlighted match with hover effect
          const span = document.createElement("span");
          span.textContent = text.substring(index, index + searchText.length);
          span.style.outline = "2px solid magenta";
          span.style.borderRadius = "4px";
          span.style.padding = "2px";
          span.style.position = "relative";
          span.className = "highlighted-text";

          // Create tooltip
          const tooltip = document.createElement("div");
          tooltip.textContent = "Find References";
          tooltip.style.position = "absolute";
          tooltip.style.bottom = "120%";
          tooltip.style.left = "50%";
          tooltip.style.transform = "translateX(-50%)";
          tooltip.style.background = "black";
          tooltip.style.color = "white";
          tooltip.style.padding = "5px 8px";
          tooltip.style.fontSize = "12px";
          tooltip.style.borderRadius = "4px";
          tooltip.style.whiteSpace = "nowrap";
          tooltip.style.opacity = "0";
          tooltip.style.transition = "opacity 0.2s ease-in-out";
          tooltip.style.pointerEvents = "none";

          // Show tooltip on hover
          span.addEventListener("mouseenter", () => {
            tooltip.style.opacity = "1";
          });
          span.addEventListener("mouseleave", () => {
            tooltip.style.opacity = "0";
          });

          // Click event to reference search
          span.addEventListener("click", () => {
            const searchURL = `https://www.google.com/search?q=${encodeURIComponent(
              span.textContent?.substring(0, searchText.length) || ""
            )}`;
            window.open(searchURL, "_blank");
          });

          span.style.cursor = "pointer";
          span.appendChild(tooltip);
          frag.appendChild(span);

          currentIndex = index + searchText.length;
        }

        // Add remaining text
        if (currentIndex < text.length) {
          frag.appendChild(
            document.createTextNode(text.substring(currentIndex))
          );
        }

        // Only replace if we found matches
        if (frag.childNodes.length > 0) {
          parent.replaceChild(frag, node);
        }
      } else {
        node.childNodes.forEach(walkDOM);
      }
    };

    document.body.childNodes.forEach(walkDOM);
  }, []);

  return { highlightMatches };
};
