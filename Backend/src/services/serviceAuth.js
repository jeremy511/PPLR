import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";
import * as AuthRepo from "../Repositories/authRepository.js";
import { sendPasswordResetEmail, sendRegistrationOTPEmail } from "./serviceEmail.js";
import { AppError, ValidationError, UnauthorizedError, NotFoundError } from "../utils/errors.js";

import { JWT_SECRET } from "../config.js";

export const login = async (email, password) => {
  const normalizedEmail = email.toLowerCase();
  const publisher = await AuthRepo.findPublisherByEmail(normalizedEmail);

  if (!publisher) throw new UnauthorizedError("Usuario no encontrado");

  const isMatch = await bcrypt.compare(password, publisher.password);
  if (!isMatch) throw new UnauthorizedError("Contraseña incorrecta");

  const token = jwt.sign(
    { 
        id: publisher.id, 
        role: publisher.role, 
        email: publisher.email, 
        firstName: publisher.firstName,
        lastName: publisher.lastName 
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  return { token, publisher };
};

export const register = async ({ email, password, firstName, lastName, phone, birthdate, gender, otpCode }) => {
  const normalizedEmail = email.toLowerCase();
  
  // Verify OTP
  const storedOTP = await prisma.registrationOTP.findUnique({
      where: { email: normalizedEmail }
  });

  if (!storedOTP || storedOTP.code !== otpCode) {
      throw new ValidationError("Código de verificación inválido");
  }

  if (storedOTP.expiresAt < new Date()) {
      await prisma.registrationOTP.delete({ where: { email: normalizedEmail } });
      throw new ValidationError("El código ha expirado. Solicita uno nuevo.");
  }

  const existingUser = await prisma.publisher.findUnique({ where: { email: normalizedEmail } });

  if (existingUser) throw new ValidationError("El usuario ya existe");
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
      email: normalizedEmail,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      birthdate: birthdate ? new Date(birthdate) : null,
      gender: gender || "MALE",
      age: calculatedAge || 18, // Default fallback if birthdate missing or error
    },
  });

  //CREATE JWT TOKEN
  const token = jwt.sign(
    { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  //HIDE PASSWORD IN THE JSON
  // Clear OTP
  await prisma.registrationOTP.delete({ where: { email: normalizedEmail } });

  const { password: _, ...userWithoutPassword } = user;
  return { publisher: userWithoutPassword, token };
};

export const getAllPublishers = async () => {
    return prisma.publisher.findMany({
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            gender: true,
            age: true,
            phone: true,
            birthdate: true,
            createdAt: true
        }
    });
};

export const deletePublisher = async (id) => {
    return prisma.publisher.delete({
        where: { id }
    });
};

export const updatePublisherRole = async (id, role) => {
    // Validate role
    if (!['ADMIN', 'PUBLISHER'].includes(role)) {
        throw new ValidationError("Rol inválido");
    }

    return prisma.publisher.update({
        where: { id },
        data: { role }
    });
};

export const updatePublisher = async (id, data) => {
    const { firstName, lastName, phone, email, role, gender, age, birthdate, password } = data;
    
    const updateData = {
        firstName,
        lastName,
        phone,
        email,
        role,
        gender
    };

    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    if (birthdate) {
        const birth = new Date(birthdate);
        updateData.birthdate = birth;
        
        // Recalculate age
        const now = new Date();
        let calculatedAge = now.getFullYear() - birth.getFullYear();
        const m = now.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            calculatedAge--;
        }
        updateData.age = calculatedAge;
    } else if (age) {
        updateData.age = parseInt(age);
    }

    return prisma.publisher.update({
        where: { id: parseInt(id) },
        data: updateData
    });
};

export const requestPasswordReset = async (email) => {
    const normalizedEmail = email.toLowerCase();
    const user = await prisma.publisher.findUnique({ where: { email: normalizedEmail } });
    
    // Security: Do not confirm if email exists to avoid enumeration, 
    // but in this internal app we can be a bit more explicit or just return success always.
    if (!user) {
        console.log(`Password reset requested for non-existent email: ${email}`);
        return { message: "Si el correo está registrado, recibirás instrucciones en breve." };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Clean up old tokens
    await prisma.passwordResetToken.deleteMany({
        where: { publisherId: user.id }
    });

    await prisma.passwordResetToken.create({
        data: {
            token,
            expiresAt,
            publisherId: user.id
        }
    });

    await sendPasswordResetEmail(user.email, token, user.firstName);
    return { message: "Correo de recuperación enviado exitosamente" };
};

export const resetPasswordWithToken = async (token, newPassword) => {
    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { publisher: true }
    });

    if (!resetToken) {
        throw new ValidationError("El enlace es inválido o ya ha sido utilizado.");
    }

    if (resetToken.expiresAt < new Date()) {
        await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
        throw new ValidationError("El enlace ha expirado. Por favor, solicita uno nuevo.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.$transaction([
        prisma.publisher.update({
            where: { id: resetToken.publisherId },
            data: { password: hashedPassword }
        }),
        prisma.passwordResetToken.delete({ where: { id: resetToken.id } })
    ]);

    return { message: "Contraseña actualizada correctamente" };
};

export const requestOTP = async (email) => {
    const normalizedEmail = email.toLowerCase();
    
    // Check if user already exists
    const existingUser = await prisma.publisher.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
        throw new ValidationError("Este correo ya está registrado");
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 600000); // 10 minutes

    await prisma.registrationOTP.upsert({
        where: { email: normalizedEmail },
        update: { code: otpCode, expiresAt },
        create: { email: normalizedEmail, code: otpCode, expiresAt }
    });

    await sendRegistrationOTPEmail(normalizedEmail, otpCode);
    return { message: "Código de verificación enviado" };
};
