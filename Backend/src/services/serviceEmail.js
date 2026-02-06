import { BREVO_API_KEY, SENDER_EMAIL, CLIENT_URL } from '../config.js';

if (!BREVO_API_KEY) {
    console.warn('WARNING: BREVO_API_KEY is missing. Email sending will fail.');
}

/**
 * Helper to send emails via Brevo HTTP API v3
 * This bypasses SMTP port blocking (common in cloud providers like Railway)
 */
const sendEmail = async ({ to, subject, htmlContent }) => {
    const url = 'https://api.brevo.com/v3/smtp/email';
    
    // Sender must be a verified sender in Brevo or the login email
    const sender = { email: SENDER_EMAIL || "no-reply@pplr.app", name: "PPLR Support" };

    const body = {
        sender,
        to: [{ email: to }],
        subject,
        htmlContent
    };

    try {
        console.log(`Sending email to ${to} via Brevo API...`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Brevo API Error ${response.status}: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('Email sent successfully:', data);
        return data;
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error; // Re-throw to be caught by the service wrapper
    }
};

/**
 * Sends a password reset email to the user.
 */
export const sendPasswordResetEmail = async (email, token, firstName) => {
    const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
    
    const html = `
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
    `;

    return sendEmail({ to: email, subject: 'Recupera tu contraseña - PPLR', htmlContent: html });
};

/**
 * Sends a 6-digit OTP code to a new user for registration verification.
 */
export const sendRegistrationOTPEmail = async (email, code) => {
    const html = `
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
    `;

    return sendEmail({ to: email, subject: `${code} es tu código de verificación - PPLR`, htmlContent: html });
};
