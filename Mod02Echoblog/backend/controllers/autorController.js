import Users from "../models/usersModel.js";
import { z } from "zod";
import bcrypt from "bcrypt";
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

export const createAutor = async (request, response) => {
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
    response.status(400).json({ err: "o nome é obirgatorio" });
    return;
  }
  if (!email) {
    response.status(400).json({ err: "o email é obirgatorio" });
    return;
  }
  if (!senha) {
    response.status(400).json({ err: "A senha é obirgatoria" });
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
