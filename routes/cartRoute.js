import express from "express"
import * as cartC from "../controllers/cartController.js"
 
const router = express.Router()
 
router.get('/carts/getcart/:id',cartC.getCart)
router.get('/carts/getcartdtl/:id',cartC.getCartDtl)
router.get('/carts/sumcart/:id',cartC.sumCart)
router.post('/carts/chkcart',cartC.chkCart)
router.post('/carts/addcart',cartC.postCart)
router.post('/carts/addcartdtl',cartC.postCartDtl)
router.post('/carts/getcartbycus',cartC.getCartByCus)
export default router