import jwt from "jsonwebtoken";

/**
 * Creates a signed JWT containing the user's MongoDB id.
 * The client stores this token and sends it on protected requests.
 */
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};
