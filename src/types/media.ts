export interface MediaItem {
    type: "file" | "url";
    content: File | string;
    name: string;
}

export interface ACRResult {
    content: string;
}


