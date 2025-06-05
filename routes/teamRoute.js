import express from "express"
import * as teamC from "../controllers/teamController.js"
 
const router = express.Router()
 
router.get('/teams/getteamdtl/:id',teamC.getTeamDtl)
router.get('/teams/getteambyid/:cusId', teamC.getTeamsByCus); //

router.post('/teams/chkteam',teamC.chkTeam)

router.post('/teams/addteam',teamC.postTeam)
router.post('/teams/addteamdtl/:teamId',teamC.postTeamDtl)

router.post('/teams/getteambycus',teamC.getTeamByCus)
router.post('/teams/getteamdtlbycus',teamC.postNewTeamInAddTeam)

router.put('/teams/updteam',teamC.delPokemonTeamDtl)

// ลบม่อนในแต่ละทีม
router.delete('/teams/delteamdtl/:teamId/:index', teamC.delPokemonTeamDtl);

// ลบทีมทั้งหมด
router.delete('/teams/delteam/:teamId',teamC.deleteTeam)
router.delete('/teams/teamsDtl/:teamId',teamC.deleteTeamDtl)

//เปลี่ยนชื่อทีม
router.put('/teams/updteamname/:teamId',teamC.putName)
 
export default router