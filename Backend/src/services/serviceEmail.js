import nodemailer from 'nodemailer';
import { GMAIL_USER, GMAIL_PASS, CLIENT_URL } from '../config.js';

if (!GMAIL_USER || !GMAIL_PASS) {
    console.warn('WARNING: GMAIL_USER or GMAIL_PASS is missing. Email sending will fail.');
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS
    }
});

/**
 * Sends a password reset email to the user.
 * @param {string} email - Recipient email.
 * @param {string} token - Secret reset token.
 * @param {string} firstName - User's first name for personalization.
 */
export const sendPasswordResetEmail = async (email, token, firstName) => {
    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
    
    try {
        console.log(`Intentando enviar email de recuperación a: ${email}`);
        
        await transporter.sendMail({
            from: `"PPLR Support" <${GMAIL_USER}>`,
            to: email,
            subject: 'Recupera tu contraseña - PPLR',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4f46e5;">Hola, ${firstName}</h2>
                    <p style="color: #374151; line-height: 1.6;">
                        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en PPLR. 
                        Si no hiciste esta solicitud, puedes ignorar este correo de forma segura.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            Restablecer Contraseña
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">
                        Este enlace expirará en 1 hora por motivos de seguridad. 
                        Si el botón no funciona, copia y pega este enlace en tu navegador:
                    </p>
                    <p style="word-break: break-all; color: #4f46e5; font-size: 12px;">${resetLink}</p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} PPLR. Todos los derechos reservados.
                    </p>
                </div>
            `
        });

        console.log('Password reset email sent successfully via Nodemailer');
        return { success: true };
    } catch (err) {
        console.error('Nodemailer Error:', err);
        throw new Error('Error al enviar el email: ' + err.message);
    }
};

/**
 * Sends a 6-digit OTP code to a new user for registration verification.
 * @param {string} email - Recipient email.
 * @param {string} code - 6-digit verification code.
 */
export const sendRegistrationOTPEmail = async (email, code) => {
    try {
        console.log(`Enviando código OTP de registro a: ${email}`);
        
        await transporter.sendMail({
            from: `"PPLR Verify" <${GMAIL_USER}>`,
            to: email,
            subject: `${code} es tu código de verificación - PPLR`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <h2 style="color: #4f46e5; text-align: center;">Verifica tu correo</h2>
                    <p style="color: #374151; font-size: 16px; text-align: center;">
                        Usa el siguiente código para completar tu registro en PPLR:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; background-color: #f3f4f6; padding: 10px 20px; border-radius: 8px;">
                            ${code}
                        </span>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; text-align: center;">
                        Este código expirará en 10 minutos. Si no solicitaste este código, puedes ignorar este correo.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                        © ${new Date().getFullYear()} PPLR. Todos los derechos reservados.
                    </p>
                </div>
            `
        });

        console.log('OTP email sent successfully via Nodemailer');
        return { success: true };
    } catch (err) {
        console.error('Nodemailer Error:', err);
        throw new Error('Error al enviar el email: ' + err.message);
    }
};
