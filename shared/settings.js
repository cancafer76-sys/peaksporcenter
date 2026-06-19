import {
  defaultAnnouncements,
  defaultAbout,
  defaultContent,
  defaultFacilityAreas,
  defaultGallery,
  defaultGalleryCategories,
  defaultPackages,
  defaultPosts,
  defaultServices,
  defaultTestimonials,
  defaultTrainers
} from './defaults.js';
import {
  normalizeAbout,
  normalizeGalleryItem,
  normalizePackage,
  normalizeService,
  normalizeTestimonials,
  normalizeTrainers
} from './media.js';

export const fallbackSettings = {
  content: defaultContent,
  services: defaultServices,
  packages: defaultPackages,
  gallery: defaultGallery,
  posts: defaultPosts,
  trainers: defaultTrainers,
  about: defaultAbout,
  testimonials: defaultTestimonials,
  announcements: defaultAnnouncements,
  facilityAreas: defaultFacilityAreas,
  galleryCategories: defaultGalleryCategories
};

export function normalizeSettings(payload) {
  const source = payload && typeof payload === 'object' ? payload : {};
  const services = Array.isArray(source.services) && source.services.length
    ? source.services.map(normalizeService)
    : defaultServices.map(normalizeService);
  const packages = Array.isArray(source.packages) && source.packages.length
    ? source.packages.map(normalizePackage)
    : defaultPackages.map(normalizePackage);
  const gallery = Array.isArray(source.gallery) && source.gallery.length
    ? source.gallery.map((item, index) => normalizeGalleryItem(item, index))
    : defaultGallery.map((item, index) => normalizeGalleryItem(item, index));
  return {
    content: source.content && typeof source.content === 'object' ? source.content : defaultContent,
    services,
    packages,
    gallery,
    galleryCategories:
      Array.isArray(source.galleryCategories) && source.galleryCategories.length
        ? source.galleryCategories
        : defaultGalleryCategories,
    posts: Array.isArray(source.posts) && source.posts.length ? source.posts : defaultPosts,
    trainers: normalizeTrainers(
      Array.isArray(source.trainers) && source.trainers.length ? source.trainers : defaultTrainers
    ),
    about: normalizeAbout(source.about && typeof source.about === 'object' ? source.about : defaultAbout),
    testimonials: normalizeTestimonials(
      Array.isArray(source.testimonials) && source.testimonials.length
        ? source.testimonials
        : defaultTestimonials
    ),
    facilityAreas:
      Array.isArray(source.facilityAreas) && source.facilityAreas.length
        ? source.facilityAreas
        : defaultFacilityAreas,
    announcements:
      Array.isArray(source.announcements) && source.announcements.length
        ? source.announcements
        : defaultAnnouncements
  };
}
