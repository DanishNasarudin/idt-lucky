import { NextResponse, type NextRequest } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest, res: NextResponse) {
  const response = await req.json();
  const data = response.values;
  // console.log(data);
  if (data.email === "" || data.prize === "") {
    return NextResponse.json({ message: "No data" }, { status: 501 });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "v5787.securen.net",
      host: "v5787.securen.net",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOption = {
      from: `Ideal Tech PC <${process.env.EMAIL}>`,
      to: data.email,
      cc: process.env.EMAIL,
      replyTo: data.email,
      subject: `Ideal Tech PC Lucky Draw: You have won!`,
      html: `
      <p>Hi <b>${data.email}</b>,</p>
      <p>Congratulation! You have won ${data.prize} from Ideal Tech Lucky Draw.</p>
      <p>Screenshot this email, and we will continue to proceed with your purchase.</p>
      <p>Best regards,</p>
      <p>Ideal Tech PC Team.</p>`,
    };

    // transporter.verify(function (error: any, success: any) {
    //   if (error) {
    //     console.log(error);
    //   } else {
    //     console.log("Server is ready to take our messages");
    //   }
    // });

    await transporter.sendMail(mailOption);
    return NextResponse.json({ message: "Email Sent" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 502 });
  }
}
