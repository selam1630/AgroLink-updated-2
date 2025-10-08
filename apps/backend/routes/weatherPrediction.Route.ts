import { Router } from "express";
import { getWeatherAndCropAdviceForDashboard } from "../controllers/weatherPrediction.controller";

const router = Router();
router.post("/advice-for-dashboard", getWeatherAndCropAdviceForDashboard);

export default router;
