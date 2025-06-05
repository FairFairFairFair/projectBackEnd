import database from "../service/database.js";

export async function postMovePokemon(req, res) {
    console.log(`POST / pokemonMove is Requested`);
    try {
      //not null
      if (req.body.moveId == null || req.body.pokeId == null ) {
        return res.status(422).json({
          error: "moveId and pokeId is required",
        });
      }
  
      const existsResultMoveId = await database.query({
        text: `SELECT EXISTS (SELECT * FROM "pokeMove" WHERE "moveId" = $1)`,
        values: [req.body.moveId],
      });
  
      const existsResultPokeId = await database.query({
        text: `SELECT EXISTS (SELECT * FROM "pokeMove" WHERE "pokeId" = $1)`,
        values: [req.body.pokeId],
      });
  
      //unique key
      if (existsResultMoveId.rows[0].exists && existsResultPokeId.rows[0].exists) {
        return res.status(409).json({
          error: `moveId & PokeId: is Exists !!`,
        });

        
      }
  
      const result = await database.query({
        text: `INSERT INTO "pokeMove" ("pokeId","moveId","level")
                  VALUES ($1,$2,$3)`,
        values: [
          req.body.pokeId,
          req.body.moveId,
          req.body.level,
        ],
      });
      const bodyData = req.body;
      const dateTime = new Date();
      bodyData.createDate = dateTime;
      res.status(201).json(bodyData);
    } catch (err) {
      return res.status(500).json({
        err: err.message,
      });
    }
  }

  export async function getMovePokemon(req, res) {
    console.log(`GET / pokemons is Requested`);
    try {
      const result = await database.query(`
        SELECT * FROM "pokeMove"
      `);
      return res.json(result.rows);
    }
    catch (err) {
      return res.status(500).json({
        error: err.message,
      });
    }
  }