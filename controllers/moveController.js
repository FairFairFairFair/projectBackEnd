import database from "../service/database.js";

export async function getAllMove(req, res) {
  console.log(`GET / moves is Requested`);
  try {
    const result = await database.query(`SELECT p.* FROM moves p ORDER BY "moveId" ASC`);
    return res.status(200).json(result.rows);
  }
  catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}

export async function getMoveById(req, res) {
  try {
    const result = await database.query({
      text: `SELECT * FROM moves WHERE "moveId" = $1`, // ✅ เพิ่ม WHERE
      values: [req.params.id], // ✅ ใช้ค่าจาก params อย่างถูกต้อง
    });

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: `id: ${req.params.id} is not found`,
      });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
}


export async function postMove(req, res) {
  console.log(`POST / move is Requested`);
  try {
    //not null
    if (req.body.moveId == null || req.body.name == null) {
      return res.status(422).json({
        error: "moveId and name is required",
      });
    }

    const existsResult = await database.query({
      text: `SELECT EXISTS (SELECT * FROM moves WHERE "moveId" = $1)`,
      values: [req.body.pdId],
    });

    //unique key
    if (existsResult.rows[0].exists) {
      return res.status(409).json({
        error: `moveId : ${req.body.moveId} is Exists !!`,
      });
    }
    const result = await database.query({
      text: `INSERT INTO moves ("moveId","name","type","category","power","accuracy","pp","effect")
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      values: [
        req.body.moveId,
        req.body.name,
        req.body.type,
        req.body.category,
        req.body.power,
        req.body.accuracy,
        req.body.pp,
        req.body.effect,
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

export async function deleteMove(req, res) {
    console.log(`DELETE / move id : ${req.params.id} is Requested`);
    try {
      const result = await database.query({
        text: `DELETE FROM "moves"
               WHERE "moveId"=$1 ;
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