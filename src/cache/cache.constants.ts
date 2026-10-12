export const WISHES_CACHE_KEY = 'wishes:all';

export function getWishCacheKey(id: number) {
  return `wish:${id}`;
}

export function getUserOffersCacheKey(userId: number) {
  return `offers:user:${userId}`;
}

export function getOfferCacheKey(id: number) {
  return `offer:${id}`;
}

export function getUserWishlistsCacheKey(userId: number) {
  return `wishlists:user:${userId}`;
}

export function getWishlistCacheKey(id: number) {
  return `wishlist:${id}`;
}
