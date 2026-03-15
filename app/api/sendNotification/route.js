import admin from "@/lib/firebaseAdmin";

export async function POST(req) {
  try {
    const { title, body, topic } = await req.json();

    const message = {
      notification: {
        title: title,
        body: body,
      },
      topic: topic,
    };

    const response = await admin.messaging().send(message);

    return Response.json({
      success: true,
      messageId: response,
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error.message,
    });
  }
}