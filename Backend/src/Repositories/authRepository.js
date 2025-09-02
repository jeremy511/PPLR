// src/repositories/authRepository.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const findPublisherByEmail = async (email) => {
  return await prisma.publisher.findUnique({ where: { email } });
};