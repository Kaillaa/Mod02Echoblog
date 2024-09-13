import { Posts , Users}  from "../models/usersModel.js";
import { z } from "zod";
import fs from 'fs'
import formatZodError from "../helpers/zodError.js";
import { where } from "sequelize";

// Validações com ZOD
const createSchema = z.object({
  titulo: z
    .string()
    .min(3, { msg: "É obrigatorio por titulo maior que 3 caracteres " })
    .transform((txt) => txt.toLowerCase()),
  conteudo: z
    .string()
    .min(5, { msg: "A descricao deve ter pelo menos 5 caracteres" }),

});

const getSchema = z.object({
  id: z.string().uuid({msg: "Id do post está inválido"})
})


export const create = async (request, response) => {
    const bodyValidation = createSchema.safeParse(request.body)
    
    if(!bodyValidation.success){
      response.status(400).json({msg: "Os dados recebidos do corpo são invalidos", detalhes: bodyValidation.error})
      return
    }
  
    const { titulo, conteudo,autor,imagem } = request.body;

  
    if (!titulo) {
      response.status(400).json({ err: "A tarefa é obirgatoria" });
      return;
    }
    if (!conteudo) {
      response.status(400).json({ err: "A descricao é obirgatoria" });
      return;
    }
    if (!autor) {
      response.status(400).json({ err: "o autor é obirgatoria" });
      return;
    }

        Users.hasMany(Posts)
  
    const novopost = {
      titulo,
      conteudo,
      autor,
      imagem,
    };
    try {
      await Posts.create(novopost);
      response.status(201).json({ msg: "Posts Cadastrado" });
    } catch (error) {
      console.error(error);
      response.status(500).json({ Err: "Erro ao cadastrar os posts" });
    }
  };

export const postall = async (request, response) => {

    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const offset = (page - 1) * 10;
    try {
      const postagens = await Posts.findAndCountAll({
        limit,
        offset,
      });
      const totalPaginas = Math.ceil(postagens.count / limit);
      response.status(200).json({
        totalTarefas: postagens.count,
        totalPaginas,
        paginaAtual: page,
        itemsPorPagina: limit,
        proximaPagina:
          totalPaginas === 0
            ? null
            : `http://localhost:3333/tarefas?page=${page + 1}`,
        postagens: postagens.rows,
      });
    } catch (error) {
      response.status(500).json({ msg: "Erro ao buscar tarefas" });
    }
  };
export const getbyid = async (request, response) => {

   const id = request.params.id 
   console.log(id)
    try {
      const postagens = await Posts.findOne({
        where: {id},
        raw:true,
      });


      console.log(postagens)
      if(postagens){
      response.status(200).json({
        postagens: postagens,
      });
    }
    else
      response.status(404).json({ msg: "Não existe esse post" });
  
    } catch (error) {
      response.status(500).json({ msg: "Erro ao buscar postagens" });
    }
  };
export const deleteinformacoes = async (request, response) => {

   const id = request.params.id
   console.log(request.headers.authorization.split(" ")[1])
   console.log(id)
    try {

      jwt.verify(token, process.env.TOKEN, function(err, decoded) {
        if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
       console.log(decoded);
      if(decoded.papel != "administrador") {
        
      }
      });
      const postagens = await Posts.destroy({
        where: {id}
      });

      response.status(500).json({ msg: "Posts deletado" });
  
    } catch (error) {
      response.status(500).json({ msg: "Erro ao buscar postagens" });
    }
  };
export const atualizarinformacoes = async (request, response) => {

   const id = request.params.id 
   const bodyValidation = createSchema.safeParse(request.body)
    
   if(!bodyValidation.success){
     response.status(400).json({msg: "Os dados recebidos do corpo são invalidos", detalhes: bodyValidation.error})
     return
   }
 
   const { titulo, conteudo,autor,imagem } = request.body;

 
   if (!titulo) {
     response.status(400).json({ err: "A tarefa é obirgatoria" });
     return;
   }
   if (!conteudo) {
     response.status(400).json({ err: "A descricao é obirgatoria" });
     return;
   }
   if (!autor) {
     response.status(400).json({ err: "A descricao é obirgatoria" });
     return;
   }



 
   const novopost = {
     titulo,
     conteudo,
     autor,
     imagem,
   };
   try {
     await Posts.update(novopost , { where:{id} });
     response.status(201).json({ msg: "Posts Atualizado" });
   } catch (error) {
     console.error(error);
     response.status(500).json({ Err: "Erro ao Atualizado os posts" });
   }
  };

  export const imagesend = async (request, response) => {

    const id = request.params.id 
    console.log(id)
    try {

      fs.writeFile(`imagem/perfil/${id}.png`, request.body, (error) => {
        if (error) {
          throw error;
        }
      });
      await Posts.update({imagem_url: `imagem/perfil/${id}.png`} , { where:{id} });
      response.status(201).json({ msg: "Posts Atualizado" });
    } catch (error) {
      console.error(error);
      response.status(500).json({ Err: "Erro ao Atualizado os posts" });
    }
   };