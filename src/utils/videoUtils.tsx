


export function getVideoEmbedUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
  
      // YouTube
      if (
        urlObj.hostname.includes("youtube.com") ||
        urlObj.hostname.includes("youtu.be")
      ) {
        const videoId = urlObj.hostname.includes("youtu.be")
          ? urlObj.pathname.slice(1)
          : urlObj.searchParams.get("v");
        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }
  
      // Dailymotion
      if (urlObj.hostname.includes("dailymotion.com")) {
        const videoId = urlObj.pathname.split("/").pop()?.split("_")[0];
        if (videoId) {
          return `https://www.dailymotion.com/embed/video/${videoId}`;
        }
      }
  
      return url; // Return original URL if not a video platform
    } catch {
      return null;
    }
  }