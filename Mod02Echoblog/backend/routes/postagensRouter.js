import { Router } from "express";
import * as posts from "../controllers/postagensController.js";
import bodyParser from "body-parser"

const router = Router();

router.post("/", posts.create);
router.get("/", posts.postall);
router.get("/:id", posts.getbyid);
router.delete("/:id", posts.deleteinformacoes);
router.put("/:id", posts.atualizarinformacoes);
router.post("/:id/imagem", bodyParser.raw({type: ["image/jpeg", "image/png"], limit: "5mb"})  , posts.imagesend);

export default router;
