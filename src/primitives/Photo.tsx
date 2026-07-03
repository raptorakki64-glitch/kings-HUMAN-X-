import { PhotoRef } from "../content";

interface PhotoProps {
  photo: PhotoRef;
  className?: string;
}

export default function Photo({ photo, className = "" }: PhotoProps) {
  return (
    <figure className={className}>
      <div className="photo-frame" style={{ aspectRatio: photo.ratio }}>
        <img src={photo.src} alt={photo.alt} loading="lazy" />
      </div>
      {photo.caption && (
        <figcaption className="mt-3 font-mono text-xs uppercase tracking-[0.15em] text-text-low">
          {photo.caption}
        </figcaption>
      )}
    </figure>
  );
}
