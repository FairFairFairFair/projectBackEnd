import express from "express" ;
import * as moveC from "../controllers/moveController.js"

const router = express.Router();
router.get("/move", moveC.getAllMove);
router.get("/move/:id", moveC.getMoveById);
router.post("/move/", moveC.postMove);
router.delete("/move/:id", moveC.deleteMove);

export default router;