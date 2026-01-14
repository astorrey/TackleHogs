export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateWeight(weight: number | null | undefined): boolean {
  if (!weight) return true; // Optional field
  return weight > 0 && weight < 1000; // Reasonable range
}

export function validateLength(length: number | null | undefined): boolean {
  if (!length) return true; // Optional field
  return length > 0 && length < 200; // Reasonable range in inches
}

export function validateCoordinates(latitude: number, longitude: number): boolean {
  return (
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}
