import Image from "next/image";

interface ImagePreviewProps {
  url: string;
  alt: string;
}

export function ImagePreview({ url, alt }: ImagePreviewProps) {
  return (
    <div className="relative w-full h-[600px] flex items-center justify-center">
      <Image src={url} alt={alt} fill className="object-contain" />
    </div>
  );
}
