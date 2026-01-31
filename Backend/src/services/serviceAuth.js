// src/services/authService.js
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import * as AuthRepo from "../Repositories/authRepository.js";

import { JWT_SECRET } from "../config.js";

export const login = async (email, password) => {
  
  const publisher = await AuthRepo.findPublisherByEmail(email);

  if (!publisher) throw new Error("Usuario no encontrado");

  const isMatch = await bcrypt.compare(password, publisher.password);
  if (!isMatch) throw new Error("Contraseña incorrecta");

  const token = jwt.sign(
    { id: publisher.id, role: publisher.role, email: publisher.email, name: publisher.name },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { token, publisher };
};

export const register = async ({ email, password, name, birthdate, gender }) => {
  const existingUser = await prisma.publisher.findUnique({ where: { email } });

  if (existingUser) throw new Error("El usuario ya existe");
  const hashedPassword = await bcrypt.hash(password, 10);

  // Age calculation
  let calculatedAge = 0;
  if (birthdate) {
    const birth = new Date(birthdate);
    const now = new Date();
    calculatedAge = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        calculatedAge--;
    }
  }

  const user = await prisma.publisher.create({
    data: {
      email,
      password: hashedPassword,
      name,
      birthdate: birthdate ? new Date(birthdate) : null,
      gender: gender || "MALE",
      age: calculatedAge || 18, // Default fallback if birthdate missing or error
    },
  });

  //CREATE JWT TOKEN
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  //HIDE PASSWORD IN THE JSON
  const { password: _, ...userWithoutPassword } = user;
  return { publisher: userWithoutPassword, token };
};

export const getAllPublishers = async () => {
    return prisma.publisher.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });
};
