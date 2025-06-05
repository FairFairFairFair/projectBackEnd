import database from "../service/database.js";

export async function getAllPokemon(req, res) {
  console.log(`GET / pokemons is Requested`);
  try {
    const result = await database.query(`
      SELECT 
          p.*,
          json_agg(
              json_build_object(
                  'id', m."moveId", 
                  'level', pm."level"
              ) ORDER BY pm."level"
          ) FILTER (WHERE pm."moveId" IS NOT NULL) AS moves
      FROM "pokemons" p
      LEFT JOIN "pokeMove" pm ON p."pokeId" = pm."pokeId"
      LEFT JOIN "moves" m ON pm."moveId" = m."moveId"
      GROUP BY p."pokeId"
      ORDER BY p."pokeId" ;
    `);
    // WHERE p."type_1" = 'grass'
    // WHERE p."name" = 'Bulbasaur'
    return res.json(result.rows);
    
  }
  catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

export async function getAllPokemonSortById(req, res) {
  console.log(`GET / pokemons is Requested`);
  try {
    const result = await database.query(`
      SELECT 
          p.*,
          json_agg(
              json_build_object(
                  'id', m."moveId", 
                  'level', pm."level"
              ) ORDER BY pm."level"
          ) FILTER (WHERE pm."moveId" IS NOT NULL) AS moves
      FROM "pokemons" p
      LEFT JOIN "pokeMove" pm ON p."pokeId" = pm."pokeId"
      LEFT JOIN "moves" m ON pm."moveId" = m."moveId"
      GROUP BY p."pokeId"
      ORDER BY p."pokeId" DESC;
    `);
    
    return res.json(result.rows);
    
  }
  catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

export async function getPokeById(req,res) {
  try {
      const result = await database.query({
        text : `SELECT 
                    p.*,
                    json_agg(
                        json_build_object(
                            'id', m."moveId", 
                            'level', pm."level"
                        ) ORDER BY pm."level"
                    ) FILTER (WHERE pm."moveId" IS NOT NULL) AS moves
                FROM "pokemons" p
                LEFT JOIN "pokeMove" pm ON p."pokeId" = pm."pokeId"
                LEFT JOIN "moves" m ON pm."moveId" = m."moveId"
                WHERE p."pokeId" = $1
                GROUP BY p."pokeId", p."name", p."type_1", p."type_2";`,
        values : [req.params.id]
      })

      if(result.rowCount == 0) {
        return res.status(404).json({
            error : `id : ${req.params.id} is not found`
        })
    }
    return res.status(200).json(result.rows[0]);
  }
  catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

export async function getPokeByName(req, res) {
  console.log(`GET / pokemons by Name is Requested`);
  try {
    const name = req.params.name;
    const result = await database.query({
      text: `
        SELECT 
            p.*,
            json_agg(
                json_build_object(
                    'id', m."moveId", 
                    'level', pm."level"
                ) ORDER BY pm."level"
            ) FILTER (WHERE pm."moveId" IS NOT NULL) AS moves
        FROM "pokemons" p
        LEFT JOIN "pokeMove" pm ON p."pokeId" = pm."pokeId"
        LEFT JOIN "moves" m ON pm."moveId" = m."moveId"
        WHERE p."name" ILIKE $1
        GROUP BY p."pokeId"
        ORDER BY p."pokeId";
      `,
      values: [`%${name}%`]
    });
    return res.json(result.rows);
  }
  catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

export async function postPokemon(req, res) {
  console.log(`POST / pokemon is Requested`);
  try {
    //not null
    if (req.body.pokeId == null || req.body.name == null) {
      return res.status(422).json({
        error: "pokeId and name is required",
      });
    }

    const existsResult = await database.query({
      text: `SELECT EXISTS (SELECT * FROM pokemons WHERE "pokeId" = $1)`,
      values: [req.body.pdId],
    });

    //unique key
    if (existsResult.rows[0].exists) {
      return res.status(409).json({
        error: `pokeId : ${req.body.pokeId} is Exists !!`,
      });
    }
    const result = await database.query({
      text: `INSERT INTO pokemons ("pokeId","name","type_1","type_2","hp","atk","def","sp_atk","sp_def","speed")
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      values: [
        req.body.pokeId,
        req.body.name,
        req.body.type_1,
        req.body.type_2,
        req.body.hp,
        req.body.atk,
        req.body.def,
        req.body.sp_atk,
        req.body.sp_def,
        req.body.speed,
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

export async function deletePokemon(req, res) {
    console.log(`DELETE / pokemon id : ${req.params.id} is Requested`);
    try {
      const result = await database.query({
        text: `DELETE FROM "pokemons"
               WHERE "pokeId"=$1 ;
              `,
        values: [req.params.id],
      });
 
      if(result.rowCount == 0) {
          return res.status(404).json({
              error : `id : ${req.params.id} is not found`
          })
      }
      res.status(204).end()
     
    }
    catch (err) {
      return res.status(500).json({
        error: err.message,
      });
    }
}

export async function getPokeByType(req, res) {
  console.log(`GET / pokemons by type is Requested`);
  try {
    const type = req.params.type;
    const result = await database.query({
      text: `
        SELECT 
            p.*,
            json_agg(
                json_build_object(
                    'id', m."moveId", 
                    'level', pm."level"
                ) ORDER BY pm."level"
            ) FILTER (WHERE pm."moveId" IS NOT NULL) AS moves
        FROM "pokemons" p
        LEFT JOIN "pokeMove" pm ON p."pokeId" = pm."pokeId"
        LEFT JOIN "moves" m ON pm."moveId" = m."moveId"
        WHERE p."type_1" ILIKE $1 OR p."type_2" ILIKE $1
        GROUP BY p."pokeId"
        ORDER BY p."pokeId";
      `,
      values: [`%${type}%`]
    });
    return res.json(result.rows);
  }
  catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

