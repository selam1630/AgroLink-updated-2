import { Request, Response } from "express";
import prisma from "../prisma/prisma";

/**
 * @route 
 * @description 
 */
export const addFarmerToRegistry = async (req: Request, res: Response) => {
  const { name, phone, region } = req.body;
  const adminId = req.user?.id; 

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  try {
    const existingFarmer = await prisma.farmerRegistry.findUnique({
      where: { phone },
    });

    if (existingFarmer) {
      return res
        .status(400)
        .json({ error: "Farmer with this phone already exists" });
    }

    const farmer = await prisma.farmerRegistry.create({
      data: {
        name,
        phone,
        region,
        addedById: adminId!,
      },
    });

    res.status(201).json({ message: "Farmer added to registry", farmer });
  } catch (error) {
    console.error("Error adding farmer:", error);
    res.status(500).json({ error: "Failed to add farmer" });
  }
};

/**
 * @route 
 * @description 
 */
export const listFarmers = async (req: Request, res: Response) => {
  try {
    const farmers = await prisma.farmerRegistry.findMany({
      include: {
        addedBy: { select: { id: true, name: true, phone: true } },
      },
    });

    res.status(200).json({ farmers });
  } catch (error) {
    console.error("Error fetching farmers:", error);
    res.status(500).json({ error: "Failed to fetch farmers" });
  }
};

/**
 * @route GET /api/admin/metrics
 * @description 
 */
export const getAdminMetrics = async (req: Request, res: Response) => {
  try {
    const totalFarmers = await prisma.farmerRegistry.count();
    const totalNews = await prisma.news.count();
    const pendingTasks = 3;
    const marketData = [
      { crop: "Teff", price: 1200, trend: "up" },
      { crop: "Maize", price: 800, trend: "down" },
      { crop: "Wheat", price: 950, trend: "stable" },
    ];

    res.status(200).json({
      totalFarmers,
      totalNews,
      pendingTasks,
      marketData,
    });
  } catch (error) {
    console.error("Error fetching admin metrics:", error);
    res.status(500).json({ error: "Failed to fetch admin metrics" });
  }
};
