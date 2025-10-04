import { Request, Response } from "express";
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

const generateRecommendation = (soil: any) => {
  if (soil.ph < 6) return "Soil is acidic, apply lime and nitrogen fertilizer.";
  if (soil.ph > 7.5) return "Soil is alkaline, apply organic matter and sulfur.";
  if (soil.nitrogen < 50) return "Add more nitrogen-rich fertilizer (like urea).";
  if (soil.phosphorus < 30) return "Apply phosphorus fertilizer (DAP).";
  if (soil.potassium < 30) return "Add potassium fertilizer (MOP).";
  return "Soil conditions are good, maintain balance.";
};

// ** UPDATED MOCK DATA: Now includes specificLocation for better accuracy **
const mockSoilDataByLocation = [
  {
    region: "Oromia",
    specificLocation: "Adama",
    ph: 5.5,
    nitrogen: 40,
    phosphorus: 25,
    potassium: 30,
  },
  {
    region: "Oromia",
    specificLocation: "Bishoftu",
    ph: 6.2,
    nitrogen: 55,
    phosphorus: 35,
    potassium: 32,
  },
  {
    region: "Amhara",
    specificLocation: "Bahir Dar",
    ph: 7.5,
    nitrogen: 50,
    phosphorus: 40,
    potassium: 35,
  },
  {
    region: "Amhara",
    specificLocation: "Gondar",
    ph: 7.8,
    nitrogen: 45,
    phosphorus: 38,
    potassium: 30,
  },
  {
    region: "Addis Ababa",
    specificLocation: "Bole",
    ph: 6.5,
    nitrogen: 60,
    phosphorus: 45,
    potassium: 40,
  },
];

// ** UPDATED CONTROLLER FUNCTION to use two search parameters **
export const getFertilizerAdviceForFarmer = async (
  req: Request,
  res: Response
) => {
  const { region, specificLocation } = req.query; // Expect both region and specificLocation

  if (!region || typeof region !== "string" || !specificLocation || typeof specificLocation !== "string") {
    return res.status(400).json({ error: "Region and Specific Location query parameters are required" });
  }

  try {
    const searchRegion = region.toLowerCase().trim();
    const searchLocation = specificLocation.toLowerCase().trim();

    // 1. Find the soil data based on both region and specific location
    const soilData = mockSoilDataByLocation.find(
      (data) =>
        data.region.toLowerCase() === searchRegion &&
        data.specificLocation.toLowerCase() === searchLocation
    );

    if (!soilData) {
      return res.status(404).json({
        error: `No specific soil data found for ${specificLocation} in ${region}. Try a different location or check spelling.`,
      });
    }

    // 2. Generate the recommendation using the existing logic
    const recommendation = generateRecommendation(soilData);

    // 3. Return the detailed data and the advice
    res.status(200).json({
      region: soilData.region,
      specificLocation: soilData.specificLocation,
      soilData: {
        ph: soilData.ph,
        nitrogen: soilData.nitrogen,
        phosphorus: soilData.phosphorus,
        potassium: soilData.potassium,
      },
      recommendation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch fertilizer advice" });
  }
};
// ** END OF UPDATED CONTROLLER FUNCTION **

// Existing function for Admin dashboard
export const getRegisteredFarmers = async (req: Request, res: Response) => {
  try {
    const mockFarmers = [
      {
        id: "1",
        name: "John Doe",
        phone: "0914260633",
        email: "beletish6@gmail.com",
        soilData: {
          region: "Oromia",
          ph: 5.5,
          nitrogen: 40,
          phosphorus: 25,
          potassium: 30,
        },
      },
      {
        id: "2",
        name: "Sara Ali",
        phone: "0923456789",
        email: "sara@example.com",
        soilData: {
          region: "Amhara",
          ph: 7.5,
          nitrogen: 50,
          phosphorus: 40,
          potassium: 35,
        },
      },
      {
        id: "3",
        name: "Mekdes Taye",
        phone: "0934567890",
        email: "mekdes@example.com",
        soilData: {
          region: "Addis Ababa",
          ph: 6.5,
          nitrogen: 60,
          phosphorus: 45,
          potassium: 40,
        },
      },
    ];

    // Add recommendations for each farmer
    const farmersWithAdvice = mockFarmers.map((farmer) => ({
      ...farmer,
      recommendation: generateRecommendation(farmer.soilData),
    }));

    res.status(200).json(farmersWithAdvice);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
};

// Existing function for Admin to send SMS advice
export const sendFertilizerAdvice = async (req: Request, res: Response) => {
  const { farmerId, advice } = req.body;

  if (!farmerId || !advice) {
    return res.status(400).json({ error: "Farmer ID and advice are required" });
  }

  try {
    const farmer = {
      id: farmerId,
      name: farmerId === "1" ? "John Doe" : farmerId === "2" ? "Sara Ali" : "Mekdes Taye",
      phone: farmerId === "1" ? "0912345678" : farmerId === "2" ? "0923456789" : "0934567890",
    };

    const smsSent = await sendTextBeeSMS(
      farmer.phone,
      `Fertilizer Advice: ${advice}`
    );
    if (!smsSent)
      return res.status(500).json({ error: "Failed to send SMS" });

    res.status(200).json({ message: `Advice sent to ${farmer.name}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send fertilizer advice" });
  }
};
