import express from "express" ;
import * as pokeC from "../controllers/pokeController.js"

const router = express.Router();
router.get("/pokemon", pokeC.getAllPokemon);
router.get("/pokemonSortId", pokeC.getAllPokemonSortById);
router.get("/pokemon/:id", pokeC.getPokeById);
router.get('/pokemon/name/:name', pokeC.getPokeByName);
router.post("/pokemon/", pokeC.postPokemon);
router.delete("/pokemon/:id", pokeC.deletePokemon);
router.get("/pokemon/type/:type", pokeC.getPokeByType);

export default router;