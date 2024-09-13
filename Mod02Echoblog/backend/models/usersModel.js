import conn from "../config/conn.js";
import { DataTypes } from "sequelize";



export const Posts = conn.define(
  "postagens",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    titulo: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    conteudo: { type: DataTypes.STRING, allowNull: false , required: true, },
    autor: { type: DataTypes.STRING, allowNull: false , required: true, },
    imagem_url: { type: DataTypes.STRING , allowNull : true , required: false ,}

  },
  {
    tableName: "postagens",
  }
);




export const Users = conn.define(
  "users",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      required: true,
    },
    email: { type: DataTypes.STRING, allowNull: false, required: true },
    senha: { type: DataTypes.STRING, allowNull: false, required: true },
    papel: { type: DataTypes.STRING, allowNull: false, required: true },
  },
  {
    tableName: "users",
  }
);


