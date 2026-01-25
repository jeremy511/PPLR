import prisma from "../lib/prisma.js";

export const findPublisherByEmail = async (email) => {
  return await prisma.publisher.findUnique({ where: { email } });
};

export const findPublisherById = async (id) => {
  return await prisma.publisher.findUnique({ where: { id } });
};

