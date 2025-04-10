

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(
  payload: string,
): string {
  const signedToken = jwt.sign({ token: payload }, JWT_SECRET);
  console.log('signedToken', signedToken)
  return signedToken;
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { token: string };
    console.log("Decoded token:", decoded.token);
    return decoded.token; // Return the original token
  } catch (error) {
    console.log(error,"error in decode token")
  }
}