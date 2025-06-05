import express from "express"
import * as productC from "../controllers/productController.js"

const router = express.Router();
router.get("/products", productC.getAllProducts);
router.get("/products/ten", productC.getTenProducts);
router.get("/products/:id", productC.getProductById);
router.get("/products/search/:id", productC.getSearchProduct);
router.post("/products/", productC.postProduct);
router.put("/products/:id", productC.putAllProducts);
router.delete("/products/:id", productC.deleteProducts);

// เพิ่ม Route สำหรับดึงข้อมูลโดย Brand ID
router.get("/products/brands/:id", productC.getProductByBrandId)

export default router;