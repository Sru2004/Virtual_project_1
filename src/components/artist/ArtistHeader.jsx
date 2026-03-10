import img5 from '../../assets/img5.png';
import {
  Mail,
  Phone,
  MapPin,
  Camera,
  Globe,
  Instagram,
  Facebook,
} from 'lucide-react';
import { api } from '../../lib/api';
import { getImageUrl } from '../../lib/imageUtils';

const ArtistHeader = ({ profile, artistProfile, onProfilePictureUpdate }) => {
  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      await api.uploadProfilePicture(profile?.id || '', formData);
      onProfilePictureUpdate?.();
    } catch (err) {
      console.error('Profile picture update failed', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      {/* HEADER CARD */}
      <div
        className="rounded-2xl shadow-xl p-8"
        style={{
          backgroundImage: `url(${img5})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex items-start gap-6 bg-white/80 backdrop-blur-sm rounded-xl p-6">
          {/* Avatar */}
          <div className="relative w-20 h-20 flex-shrink-0">
            {profile?.profile_picture ? (
              <img
                src={getImageUrl(profile.profile_picture)}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                {profile?.full_name?.[0] || 'A'}
              </div>
            )}

            {/* Camera */}
            <label
              htmlFor="profile-picture-upload"
              className="absolute bottom-0 right-0 bg-amber-500 hover:bg-amber-600 text-white rounded-full p-1 cursor-pointer shadow-md"
            >
              <Camera className="h-4 w-4" />
            </label>
            <input
              id="profile-picture-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureChange}
            />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              {artistProfile?.artist_name || profile?.full_name}
            </h1>

            {artistProfile?.art_style && (
              <p className="text-sm font-semibold text-amber-600 mb-3">
                {artistProfile.art_style} Artist
              </p>
            )}

            {/* Contact Info */}
            <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
              {(artistProfile?.email || profile?.email) && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-amber-600" />
                  <span>{artistProfile?.email || profile?.email}</span>
                </div>
              )}

              {(artistProfile?.phone || profile?.phone) && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-600" />
                  <span>{artistProfile?.phone || profile?.phone}</span>
                </div>
              )}

              {artistProfile?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-600" />
                  <span>{artistProfile.location}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {artistProfile?.bio && (
              <p className="text-sm text-gray-700 max-w-xl leading-relaxed">
                {artistProfile.bio}
              </p>
            )}

            {/* Stats */}
            {(artistProfile?.years_experience !== undefined ||
              artistProfile?.exhibitions !== undefined ||
              artistProfile?.awards_won !== undefined) && (
              <div className="flex gap-8 mt-5 text-center">
                {artistProfile?.years_experience !== undefined && (
                  <div>
                    <div className="text-xl font-bold text-amber-600">
                      {artistProfile.years_experience}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">
                      Experience
                    </div>
                  </div>
                )}

                {artistProfile?.exhibitions !== undefined && (
                  <div>
                    <div className="text-xl font-bold text-amber-600">
                      {artistProfile.exhibitions}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">
                      Exhibitions
                    </div>
                  </div>
                )}

                {artistProfile?.awards_won !== undefined && (
                  <div>
                    <div className="text-xl font-bold text-amber-600">
                      {artistProfile.awards_won}
                    </div>
                    <div className="text-xs text-gray-600 uppercase tracking-wide">
                      Awards
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social Links */}
            {artistProfile?.social_links && (
              <div className="flex gap-3 mt-4">
                {artistProfile.social_links.website && (
                  <a
                    href={artistProfile.social_links.website}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-gray-100 hover:bg-amber-100 rounded-full text-amber-600"
                  >
                    <Globe className="h-4 w-4" />
                  </a>
                )}
                {artistProfile.social_links.instagram && (
                  <a
                    href={`https://instagram.com/${artistProfile.social_links.instagram}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-gray-100 hover:bg-pink-100 rounded-full text-pink-600"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {artistProfile.social_links.facebook && (
                  <a
                    href={`https://facebook.com/${artistProfile.social_links.facebook}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-gray-100 hover:bg-blue-100 rounded-full text-blue-600"
                  >
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtistHeader;
