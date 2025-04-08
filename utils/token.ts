

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(
  payload: string,
  expiresIn: string | number
): string {
  const signedToken = jwt.sign({ token: payload }, JWT_SECRET, { expiresIn });
  console.log('signedToken', signedToken)
  return signedToken;
}

export function verifyToken(token: string): string {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { token: string };
    console.log("Decoded token:", decoded.token);
    return decoded.token; // Return the original token
  } catch (error) {
    console.error("Token verification error:", error);
    throw new Error("Invalid or expired token");
  }
}