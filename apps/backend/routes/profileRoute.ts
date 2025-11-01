import { Router } from "express";
import { getAdminProfile, updateAdminProfile } from "../controllers/profileController";
import { authenticateToken, protect } from "../middlewares/auth.middleware";

const router = Router();
router.get("/:id", authenticateToken, protect(["admin"]), getAdminProfile);
router.put("/:id", authenticateToken, protect(["admin"]), updateAdminProfile);

export default router;
