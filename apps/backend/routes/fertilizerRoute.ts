import { Router } from "express";
import { getRegisteredFarmers, sendFertilizerAdvice,getFertilizerAdviceForFarmer } from "../controllers/fertilizerController";
import { protect } from "../middlewares/auth.middleware";

const router = Router();
router.get("/farmers", protect(["admin"]), getRegisteredFarmers);
router.post("/send-advice", protect(["admin"]), sendFertilizerAdvice);
router.get("/advice/search", protect(["farmer", "admin"]), getFertilizerAdviceForFarmer);

export default router;
