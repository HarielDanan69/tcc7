import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Note = db.define(
  "notes",
  {
    judul: DataTypes.STRING,
    event: DataTypes.STRING,
    tanggal: DataTypes.STRING,
    catatan: DataTypes.STRING,
  },
  {
    freezeTableName: true,
  }
);

export default Note;
db.sync().then(() => console.log("Database synced"));


//(async () => {
  //await db.sync();
//})();
