import { Users , Posts}  from "../models/usersModel.js";

import { z } from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import fs from "fs";
import formatZodError from "../helpers/zodError.js";
import { where } from "sequelize";

// Validações com ZOD
const createSchema = z.object({
  nome: z
    .string()
    .min(3, { msg: "É obrigatorio por um nome maior que 3 caracteres " })
    .transform((txt) => txt.toLowerCase()),
  email: z
    .string()
    .min(5, { msg: "A descricao deve ter pelo menos 5 caracteres" }),
  senha: z.string().min(5, { msg: "A senha deve ter pelo menos 8 caracteres" }),
});

const getSchema = z.object({
  id: z.string().uuid({ msg: "Id do post está inválido" }),
});

export const create = async (request, response) => {
  const bodyValidation = createSchema.safeParse(request.body);

  if (!bodyValidation.success) {
    response.status(400).json({
      msg: "Os dados recebidos do corpo são invalidos",
      detalhes: bodyValidation.error,
    });
    return;
  }

  let { nome, email, senha, papel } = request.body;

  if (!nome) {
    response.status(400).json({ err: "o Nome é obirgatoria" });
    return;
  }
  if (!email) {
    response.status(400).json({ err: "o Email é obirgatoria" });
    return;
  }
  if (!senha) {
    response.status(400).json({ err: "A Senha é obirgatoria" });
    return;
  }
  if (!papel) papel = "leitor";

  const user = await Users.findOne({
    where: { email },
    raw: true,
  });
  if (user) {
    response.status(500).json({ msg: "Email já foi cadastrado" });
    return;
  }

  bcrypt.hash(senha, 10, async (err, hash) => {
    senha = hash;
    const novopost = {
      nome,
      email,
      senha,
      papel,
    };

    try {
      await Users.create(novopost);
      response.status(201).json({ msg: "User Cadastrado" });
    } catch (error) {
      console.error(error);
      response.status(500).json({ Err: "Erro ao cadastrar os user" });
    }
  });
};

export const AtualizarUser = async (request, response) => {
  const bodyValidation = createSchema.safeParse(request.body);

  if (!bodyValidation.success) {
    response.status(400).json({
      msg: "Os dados recebidos do corpo são invalidos",
      detalhes: bodyValidation.error,
    });
    return;
  }
  const id = request.params.id 
  let { nome, email, senha } = request.body;

  if (!nome) {
    response.status(400).json({ err: "o Nome é obirgatoria" });
    return;
  }
  if (!email) {
    response.status(400).json({ err: "o Email é obirgatoria" });
    return;
  }
  if (!senha) {
    response.status(400).json({ err: "A Senha é obirgatoria" });
    return;
  }

  const user = await Users.findOne({
    where: { email },
    raw: true,
  });
  if (user) {
    response.status(500).json({ msg: "Email já foi atualizado" });
    return;
  }

  bcrypt.hash(senha, 10, async (err, hash) => {
    senha = hash;
    const novopost = {
      nome,
      email,
      senha,
    };

    try {
      await Users.update(novopost , { where:{id} });
      response.status(201).json({ msg: "User Atualizado" });
    } catch (error) {
      console.error(error);
      response.status(500).json({ Err: "Erro ao atualizar o user" });
    }
  });
};

export const UserLogin = async (request, response) => {
  let { email, senha } = request.body;
  if (!email) {
    response.status(400).json({ err: "o Email é obirgatoria" });
    return;
  }
  if (!senha) {
    response.status(400).json({ err: "A Senha é obirgatoria" });
    return;
  }
  console.log(Posts)
  try {
    const user = await Users.findOne({
      where: { email },
      // include: [Posts],
      raw: true,
    });

    console.log(user)

    bcrypt.compare(senha, user.senha, function (err, result) {
      if (result == true){
        let token = jwt.sign({ user } ,process.env.TOKEN ,{
          expiresIn: '1h'
        });
        
        response.status(200).json({ message: "Usuario Logado com sucesso" , JWTTOKEN: token  });
      }
      else if (result == false)
        response
          .status(200)
          .json({ message: "Usuario NÃO conseguiu logar" });
    });
  } catch (error) {
    response.status(500).json({ msg: "Erro ao buscar dados" });
  }
};


export const TesteJWT = async (request, response) => {
  let { token } = request.body;
  if (!token) {
    response.status(400).json({ err: "o token é obirgatoria" });
    return;
  }

  try {
    jwt.verify(token, process.env.TOKEN, function(err, decoded) {
      if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });
      

     console.log(decoded);
    });

    response.status(200).json({ msg: "All GOOD" });
  } catch (error) {
    response.status(500).json({ msg: "Erro ao buscar dados" });
  }
};
// export const getbyid = async (request, response) => {

//    const id = request.params.id
//    console.log(id)
//     try {
//       const postagens = await Posts.findOne({
//         where: {id},
//         raw:true,
//       });

//       console.log(postagens)
//       if(postagens){
//       response.status(200).json({
//         postagens: postagens,
//       });
//     }
//     else
//       response.status(404).json({ msg: "Não existe esse post" });

//     } catch (error) {
//       response.status(500).json({ msg: "Erro ao buscar postagens" });
//     }
//   };
// export const deleteinformacoes = async (request, response) => {

//    const id = request.params.id
//    console.log(id)
//     try {
//       const postagens = await Posts.destroy({
//         where: {id}
//       });

//       response.status(500).json({ msg: "Posts deletado" });

//     } catch (error) {
//       response.status(500).json({ msg: "Erro ao buscar postagens" });
//     }
//   };
// export const atualizarinformacoes = async (request, response) => {

//    const id = request.params.id
//    const bodyValidation = createSchema.safeParse(request.body)

//    if(!bodyValidation.success){
//      response.status(400).json({msg: "Os dados recebidos do corpo são invalidos", detalhes: bodyValidation.error})
//      return
//    }

//    const { titulo, conteudo,autor,imagem } = request.body;

//    if (!titulo) {
//      response.status(400).json({ err: "A tarefa é obirgatoria" });
//      return;
//    }
//    if (!conteudo) {
//      response.status(400).json({ err: "A descricao é obirgatoria" });
//      return;
//    }
//    if (!autor) {
//      response.status(400).json({ err: "A descricao é obirgatoria" });
//      return;
//    }

//    const novopost = {
//      titulo,
//      conteudo,
//      autor,
//      imagem,
//    };
//    try {
//      await Posts.update(novopost , { where:{id} });
//      response.status(201).json({ msg: "Posts Atualizado" });
//    } catch (error) {
//      console.error(error);
//      response.status(500).json({ Err: "Erro ao Atualizado os posts" });
//    }
//   };

//   export const imagesend = async (request, response) => {

//     const id = request.params.id
//     console.log(id)
//     try {

//       fs.writeFile(`imagem/perfil/${id}.png`, request.body, (error) => {
//         if (error) {
//           throw error;
//         }
//       });
//       await Posts.update({imagem_url: `imagem/perfil/${id}.png`} , { where:{id} });
//       response.status(201).json({ msg: "Posts Atualizado" });
//     } catch (error) {
//       console.error(error);
//       response.status(500).json({ Err: "Erro ao Atualizado os posts" });
//     }
//    };
