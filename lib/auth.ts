import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "pz_admin";

/**
 * La contrasena vive en la variable de entorno ADMIN_PASSWORD.
 * El valor por defecto conserva el acceso del panel anterior.
 */
function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "promo2026";
}

/**
 * Token determinista derivado de la contrasena. Permite validar la sesion sin
 * guardar estado en el servidor y sin que la contrasena viaje al navegador.
 */
export function sessionToken(): string {
  return createHmac("sha256", adminPassword())
    .update("promozone-admin-v1")
    .digest("base64url");
}

export function isValidPassword(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const a = Buffer.from(input);
  const b = Buffer.from(adminPassword());
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const expected = sessionToken();
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
