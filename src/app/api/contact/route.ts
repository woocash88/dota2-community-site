import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const escapeHtml = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function POST(request: Request) {
  try {
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json({ error: 'Brakujące pola' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `Formularz Kontaktowy <${process.env.SMTP_USER}>`,
      to: 'polishdota2inhouse@gmail.com',
      replyTo: email,
      subject: `[dota2inhouse.pl] Nowa wiadomość od ${email}`,
      text: message,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #dc2626; border-b: 1px solid #eee; padding-bottom: 10px;">
            Nowa wiadomość ze strony dota2inhouse.pl
          </h2>
          <p><strong>Od:</strong> ${escapeHtml(email)}</p>
          <p><strong>Treść:</strong></p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap; margin-top: 10px;">
            ${escapeHtml(message)}
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Błąd SMTP:', error);
    return NextResponse.json({ error: 'Błąd serwera podczas wysyłki' }, { status: 500 });
  }
}