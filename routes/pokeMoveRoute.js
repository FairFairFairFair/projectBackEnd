import express from "express" ;
import * as PokeC from "../controllers/pokeMoveController.js"

const router = express.Router();
router.get("/pokeMove", PokeC.getMovePokemon);
router.post("/pokeMove/", PokeC.postMovePokemon);

export default router;