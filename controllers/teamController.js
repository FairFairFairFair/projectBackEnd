import database from "../service/database.js";
 
export async function chkTeam(req,res) {
    console.log(`POST TEAM customer ${req.body.memEmail} is requested`);
    if (req.body.memEmail == null) {
      return res.json({  error: true, errormessage: "member Email is required"  });
    }
 
    const result = await database.query({
      text: 'SELECT * FROM teams WHERE "cusId" = $1 AND "teamCf" != true',
      values: [req.body.memEmail],
    });
    if (result.rows[0] != null) {
      return res.json({ teamExist: true, teamId: result.rows[0].teamId });
    } else {
      return res.json({ teamExist: false });
    }
}

export async function postTeam(req, res) {
  console.log(`POST /TEAM is requested `);
  try {
      if (!req.body.cusId) {
          return res.json({ teamOK: false, messageAddTeam: "cus ID is required" });
      }

      // 🔹 **เช็คก่อนว่าผู้ใช้มีทีมที่ยังไม่ได้ยืนยันอยู่หรือไม่**
      const existingTeam = await database.query({
          text: `SELECT "teamId" FROM teams WHERE "cusId" = $1 AND "teamCf" IS NULL ORDER BY "teamDate" DESC LIMIT 1`,
          values: [req.body.cusId],
      });

      if (existingTeam.rowCount > 0) {
          // 🔹 ถ้ามีทีมอยู่แล้ว → ใช้อันเดิม
          return res.json({ teamOK: true, messageAddTeam: existingTeam.rows[0].teamId });
      }

      // 🔹 ถ้ายังไม่มีทีม → สร้าง `teamId` ใหม่
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const currentDate = `${year}${month}${day}`;

      let i = 0;
      let theId = "";
      let existsResult = [];

      do {
          i++;
          theId = `${currentDate}${String(i).padStart(4, "0")}`;
          existsResult = await database.query({
              text: 'SELECT EXISTS (SELECT 1 FROM teams WHERE "teamId" = $1)',
              values: [theId],
          });
      } while (existsResult.rows[0].exists);

      // 🔹 เพิ่ม `teamId` ใหม่เข้าไป
      await database.query({
          text: `INSERT INTO teams ("teamId", "cusId", "teamDate")
                 VALUES ($1, $2, $3)`,
          values: [theId, req.body.cusId, now],
      });

      return res.json({ teamOK: true, messageAddTeam: theId });
  } catch (err) {
      return res.json({ teamOK: false, messageAddTeam: err.message });
  }
}

export async function postTeamDtl(req, res) {
    try {
        if (!req.params.teamId) {
            return res.json({
                teamDtlOK: false,
                messageAddTeamDtl: "TeamId is required",
            });
        }
        if (!req.body.pokeId) {
            return res.json({
                teamDtlOK: false,
                messageAddTeamDtl: "PokeID is required",
            });
        }
 
 
        // 🔹 ตรวจสอบจำนวน Pokémon ในทีม (ต้องไม่เกิน 6)
        const teamCountResult = await database.query({
            text: 'SELECT COUNT(*) FROM "teamDtl" WHERE "teamId" = $1',
            values: [req.params.teamId],
        });
 
        const teamCount = parseInt(teamCountResult.rows[0].count, 10);
        if (teamCount >= 6) {
            return res.json({
                teamDtlOK: false,
                messageAddTeamDtl: "Team cannot have more than 6 Pokémon",
            });
        }
 
        // 🔹 สร้าง index ใหม่โดยใช้ teamId + หมายเลขของ Pokémon ในทีม
        let newIndex;
        let i = 1;
 
        do {
            newIndex = `${req.params.teamId}${String(i).padStart(2, "0")}`; // teamId-01, teamId-02, ...
            // 🔹 ตรวจสอบว่า index นี้ซ้ำหรือไม่
            const existsResult = await database.query({
                text: 'SELECT EXISTS (SELECT 1 FROM "teamDtl" WHERE "index" = $1)',
                values: [newIndex],
            });
 
            if (!existsResult.rows[0].exists) {
                break; // ถ้าไม่ซ้ำ ออกจากลูป
            }
           
            i++; // ถ้าซ้ำ ลองตัวใหม่
        } while (true);
 
        // 🔹 เพิ่ม Pokémon ลงในทีม
        await database.query({
            text: 'INSERT INTO "teamDtl" ("teamId", "index", "pokeId") VALUES ($1, $2, $3)',
            values: [req.params.teamId, newIndex, req.body.pokeId],
        });
 
        return res.json({
            teamDtlOK: true,
            messageAddTeamDtl: `Pokémon added with index ${newIndex}`,
        });
 
    } catch (err) {
        return res.json({
            teamDtlOK: false,
            messageAddTeamDtl: "INSERT DETAIL ERROR: " + err.message,
        });
    }
//   console.log("POST /TEAMDETAIL is requested");
//   try {
//       if (req.body.teamId == null || req.body.pokeId == null) {
//           return res.json({
//               teamDtlOK: false,
//               messageAddTeamDtl: "TeamId && PokeID is required",
//           });
//       }

//       // Check if the team already has 6 Pokémon
//       const teamCountResult = await database.query({
//           text: 'SELECT COUNT(*) FROM "teamDtl" WHERE "teamId" = $1',
//           values: [req.body.teamId],
//       });

//       const teamCount = parseInt(teamCountResult.rows[0].count, 10);
//       if (teamCount >= 6) {
//           return res.json({
//               teamDtlOK: false,
//               messageAddTeamDtl: "Team cannot have more than 6 Pokémon",
//           });
//       }

//       const pokeResult = await database.query({
//           text: 'SELECT * FROM "teamDtl" tdt WHERE tdt."teamId" = $1 AND tdt."pokeId" = $2',
//           values: [req.body.teamId, req.body.pokeId],
//       });

//           try {
//               const result = await database.query({
//                   text: 'INSERT INTO "teamDtl" ("teamId", "index", "pokeId") VALUES ($1, $2, $3)',
//                   values: [req.body.teamId,req.body.index, req.body.pokeId],
//               });
//               return res.json({ teamDtlOK: true, messageAddTeam: req.body.teamId });
//           } catch (err) {
//               return res.json({
//                   teamDtlOK: false,
//                   messageAddTeamDtl: "INSERT DETAIL ERROR",
//               });
//           }
      
//   } catch (err) {
//       return res.json({
//           teamDtlOK: false,
//           messageAddTeamDtl: "INSERT DETAIL ERROR",
//       });
//   }
}
 

export async function getTeamDtl(req, res) {
    console.log("GET TeamDtl is Requested");
    try {
        const result = await database.query({
        text: 'SELECT * FROM "teamDtl" WHERE "teamId" = $1 ORDER BY "index"',
        values: [req.params.id]
        });
        return res.json(result.rows);
    }
    catch (err) {
        return res.json({
            error: err.message
        });
    }
}

export async function getTeamByCus(req, res) {
    console.log("POST Team By Customer is Requested");
    try {
        const result = await database.query({
            text: `SELECT * FROM teams WHERE "cusId" = $1 ORDER BY "teamName" DESC`,
            values: [req.body.id]
        });
        return res.json(result.rows);
    }
    catch (err) {
        return res.json({
            error: err.message
        });
    }
}

export async function delPokemonTeamDtl(req, res) {

        console.log("DEL /TEAMDETAIL is requested");
        try {
            const { teamId, index } = req.params;
    
            if (!teamId || !index) {
                return res.status(400).json({
                    teamDtlOK: false,
                    message: "teamId and index are required",
                });
            }
    
            // ตรวจสอบว่ามีข้อมูลของ teamId ในตารางหรือไม่
            const checkTeamExist = await database.query({
                text: 'SELECT * FROM "teamDtl" WHERE "teamId" = $1',
                values: [teamId],
            });
    
            if (checkTeamExist.rowCount === 0) {
                // ถ้าไม่มีข้อมูล teamId นี้เลยในตาราง ก็ไม่ต้องทำอะไร
                return res.json({
                    teamDtlOK: true,
                    message: "No data found for this teamId, nothing to delete",
                });
            }
    
            // ตรวจสอบว่ามีข้อมูลแถวที่เจาะจงจะลบหรือไม่
            const checkResult = await database.query({
                text: 'SELECT * FROM "teamDtl" WHERE "teamId" = $1 AND "index" = $2',
                values: [teamId, index],
            });
    
            if (checkResult.rowCount === 0) {
                return res.status(404).json({
                    teamDtlOK: false,
                    message: "No matching team detail found to delete",
                });
            }
    
            // ลบข้อมูล
            await database.query({
                text: 'DELETE FROM "teamDtl" WHERE "teamId" = $1 AND "index" = $2',
                values: [teamId, index],
            });
    
            return res.json({
                teamDtlOK: true,
                message: "Team detail deleted successfully",
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json({
                teamDtlOK: false,
                message: "DELETE DETAIL ERROR",
            });
        }
    
    
}

export async function postNewTeamInAddTeam(req, res) {
    console.log(`POST /TEAM is requested`);
    try {
        if (!req.body.cusId) {
            return res.json({ teamOK: false, messageAddTeam: "cus ID is required" });
        }

        // 🔹 สร้าง teamId ใหม่
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const currentDate = `${year}${month}${day}`;

        let i = 0;
        let theId = "";
        let existsResult = [];

        do {
            i++;
            theId = `${currentDate}${String(i).padStart(4, "0")}`;
            existsResult = await database.query({
                text: 'SELECT EXISTS (SELECT 1 FROM teams WHERE "teamId" = $1)',
                values: [theId],
            });
        } while (existsResult.rows[0].exists);

        // 🔹 สร้าง teamName ที่ไม่ซ้ำกัน โดยขึ้นต้นด้วย 'noob'
        let teamName = "";
        let nameExists = true;
        let nameIndex = 1;

        do {
            teamName = `noob${String(nameIndex).padStart(3, "0")}`;
            const nameCheck = await database.query({
                text: 'SELECT EXISTS (SELECT 1 FROM teams WHERE "teamName" = $1)',
                values: [teamName],
            });
            nameExists = nameCheck.rows[0].exists;
            nameIndex++;
        } while (nameExists);

        // 🔹 บันทึกข้อมูลทีม
        await database.query({
            text: `INSERT INTO teams ("teamId", "cusId", "teamDate", "teamName")
                   VALUES ($1, $2, $3, $4)`,
            values: [theId, req.body.cusId, now, teamName],
        });

        return res.json({ teamOK: true, messageAddTeam: theId });
    } catch (err) {
        return res.json({ teamOK: false, messageAddTeam: err.message });
    }
}

export async function getTeamsByCus(req, res) {
    console.log(`GET /teams/getTeamsByCus/${req.params.cusId} is requested`);
    try {
        const { cusId } = req.params;

        if (!cusId) {
            return res.status(400).json({ success: false, message: "cusId is required" });
        }

        // 🔹 ดึง teamId ทั้งหมดที่เป็นของ cusId
        const teams = await database.query({
            text: `SELECT * FROM teams WHERE "cusId" = $1 ORDER BY "teamDate" DESC`,
            values: [cusId],
        });

        return res.json({ success: true, teams: teams.rows });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
}

export async function deleteTeam(req, res) {
    console.log(`DELETE /teams/${req.params.teamId} is requested`);
    try {
        const { teamId } = req.params;

        if (!teamId) {
            return res.status(400).json({
                success: false,
                message: "teamId is required",
            });
        }

        // ตรวจสอบว่ามีข้อมูลอยู่หรือไม่ก่อนลบ
        const checkResult = await database.query({
            text: 'SELECT * FROM teams WHERE "teamId" = $1',
            values: [teamId],
        });
        

        if (checkResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No matching team found",
            });
        }

        // ลบข้อมูล
        await database.query({
            text: 'DELETE FROM teams WHERE "teamId" = $1',
            values: [teamId],
        });

        return res.json({
            success: true,
            message: `Team with teamId ${teamId} deleted successfully`,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "DELETE TEAM ERROR: " + err.message,
        });
    }
}

export async function deleteTeamDtl(req, res) {
    console.log(`DELETE /teamsDtl/${req.params.teamId} is requested`);
    try {
        const { teamId } = req.params;

        if (!teamId) {
            return res.status(400).json({
                success: false,
                message: "teamId is required",
            });
        }

        // ตรวจสอบว่ามีข้อมูลอยู่หรือไม่ก่อนลบ
        const checkResult = await database.query({
            text: 'SELECT * FROM "teamDtl" WHERE "teamId" = $1',
            values: [teamId],
        });
        

        if (checkResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No matching team found",
            });
        }

        // ลบข้อมูล
        await database.query({
            text: 'DELETE FROM "teamDtl" WHERE "teamId" = $1',
            values: [teamId],
        });

        return res.json({
            success: true,
            message: `Team with teamId ${teamId} deleted successfully`,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "DELETE TEAM ERROR: " + err.message,
        });
    }
}


export async function putName(req, res) {
    console.log(`PUT /TEAMNAME is requested`);
    try {
        const { teamId } = req.params; // รับ teamId จาก URL
        const { teamName } = req.body; // รับ teamName ใหม่จาก body

        // ตรวจสอบว่า teamId และ teamName ถูกส่งมาหรือไม่
        if (!teamId || !teamName) {
            return res.status(400).json({
                success: false,
                message: "teamId and teamName are required",
            });
        }

        // ตรวจสอบว่า teamId มีอยู่ในฐานข้อมูลหรือไม่
        const checkResult = await database.query({
            text: 'SELECT * FROM teams WHERE "teamId" = $1',
            values: [teamId],
        });

        if (checkResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No matching team found",
            });
        }

        // อัปเดต teamName
        await database.query({
            text: 'UPDATE teams SET "teamName" = $1 WHERE "teamId" = $2',
            values: [teamName, teamId],
        });

        return res.json({
            success: true,
            message: `Team name updated successfully to ${teamName}`,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: "UPDATE TEAMNAME ERROR: " + err.message,
        });
    }
}
// ในไฟล์ controller




