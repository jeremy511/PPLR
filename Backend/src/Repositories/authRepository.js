import prisma from "../lib/prisma.js";

export const findPublisherByEmail = async (email) => {
  return await prisma.publisher.findUnique({ where: { email } });
};
