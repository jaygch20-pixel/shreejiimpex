export function getOptimizedImageUrl(imageUrl, width) {
  if (!imageUrl || !Number.isFinite(width)) return imageUrl;

  let url;
  try {
    url = new URL(imageUrl);
  } catch {
    return imageUrl;
  }

  if (url.hostname !== 'res.cloudinary.com') return imageUrl;

  const marker = '/image/upload/';
  const uploadIndex = url.pathname.indexOf(marker);
  if (uploadIndex < 0) return imageUrl;

  const safeWidth = Math.min(2000, Math.max(64, Math.round(width)));
  const pathAfterUpload = url.pathname.slice(uploadIndex + marker.length);
  const versionIndex = pathAfterUpload.search(/\/v\d+\//);
  const transform = `f_auto,q_auto,c_limit,w_${safeWidth}`;
  const optimizedPath = versionIndex >= 0
    ? `${pathAfterUpload.slice(0, versionIndex)}/${transform}${pathAfterUpload.slice(versionIndex)}`
    : `${transform}/${pathAfterUpload}`;

  url.pathname = `${url.pathname.slice(0, uploadIndex + marker.length)}${optimizedPath}`;
  return url.toString();
}
