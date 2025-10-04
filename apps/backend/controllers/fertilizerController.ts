import { Request, Response } from "express";
import prisma from "../prisma/prisma";
import axios from "axios";

const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY || "";
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID || "";
const BASE_URL = "https://api.textbee.dev/api/v1";
const sendTextBeeSMS = async (recipient: string, message: string) => {
  try {
    await axios.post(
      `${BASE_URL}/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`,
      { recipients: [recipient], message },
      { headers: { "x-api-key": TEXTBEE_API_KEY, "Content-Type": "application/json" } }
    );
    return true;
  } catch (error) {
    console.error("Error sending SMS via TextBee:", error);
    return false;
  }
};
export const getRegisteredFarmers = async (req: Request, res: Response) => {
  try {
    const farmers = await prisma.user.findMany({
      where: { role: "farmer", status: "registered" },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        soilData: {
          select: {
            ph: true,
            nitrogen: true,
            phosphorus: true,
            potassium: true,
            region: true,
          },
        },
      },
    });

    res.status(200).json(farmers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
};
export const sendFertilizerAdvice = async (req: Request, res: Response) => {
  const { farmerId, advice, crop, region, problem } = req.body;

  if (!farmerId || !advice) {
    return res.status(400).json({ error: "Farmer ID and advice are required" });
  }

  try {
    const farmer = await prisma.user.findUnique({
      where: { id: farmerId },
    });

    if (!farmer) return res.status(404).json({ error: "Farmer not found" });
    const smsSent = await sendTextBeeSMS(
      farmer.phone,
      `Fertilizer Advice: ${advice}`
    );
    if (!smsSent)
      return res.status(500).json({ error: "Failed to send SMS" });
    await prisma.fertilizerAdvice.create({
      data: {
        farmerId,
        advice,
        crop: crop || null,
        region: region || null,
        problem: problem || null,
        sent: true,
        sentAt: new Date(),
      },
    });

    res.status(200).json({ message: `Advice sent to ${farmer.name}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send fertilizer advice" });
  }
};
