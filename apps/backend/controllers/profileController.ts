import { Request, Response } from "express";
import prisma from "../prisma/prisma";
export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const admin = await prisma.user.findFirst({
      where: { id, role: "admin" },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const adminProducts = await prisma.product.findMany({
      where: { userId: admin.id },
      include: {
        user: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const availableProducts = adminProducts
      .filter((p) => !p.isSold)
      .map((p) => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        description: p.description,
        image: p.imageUrl, 
        createdAt: p.createdAt,
      }));

    const soldProducts = adminProducts
      .filter((p) => p.isSold)
      .map((p) => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity,
        price: p.price,
        description: p.description,
        image: p.imageUrl,
        createdAt: p.createdAt,
      }));

    return res.status(200).json({
      admin: {
        id: admin.id,
        name: admin.name,
        phone: admin.phone,
        email: admin.email,
      },
      availableProducts,
      soldProducts,
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    return res
      .status(500)
      .json({ error: "Server error fetching admin profile" });
  }
};
export const updateAdminProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email } = req.body;

    if (!name || !phone || !email) {
      return res
        .status(400)
        .json({ error: "Name, phone, and email are required" });
    }

    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: { name, phone, email },
    });

    return res.status(200).json({
      message: "Profile updated successfully",
      admin: {
        id: updatedAdmin.id,
        name: updatedAdmin.name,
        phone: updatedAdmin.phone,
        email: updatedAdmin.email,
      },
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
};
