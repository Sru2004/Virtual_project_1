import React from "react";
import ArtworkCard from "./ArtworkCard";

export default function ArtworksGrid({
  artworks,
  wishlist,
  onWishlistToggle,
  resolveArtistName,
  resolveImageUrl,
}) {
  if (artworks.length === 0) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Artworks</h2>
        <p className="text-gray-500 bg-white p-5 rounded-xl shadow-sm">
          No artworks match your filters.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Artworks</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => {
          const artworkId = artwork._id || artwork.id;
          const isInWishlist = wishlist.some(
            (item) => item.artwork_id === artworkId
          );
          return (
            <ArtworkCard
              key={artworkId}
              artworkId={artworkId}
              artwork={artwork}
              isInWishlist={isInWishlist}
              onWishlistToggle={onWishlistToggle}
              resolveArtistName={resolveArtistName}
              resolveImageUrl={resolveImageUrl}
            />
          );
        })}
      </div>
    </div>
  );
}
