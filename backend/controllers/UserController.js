import User from "../models/UserModel.js";
import Note from "../models/NoteModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Op } from "sequelize";

export const getNotes = async (req, res) => {
  try {
    const response = await Note.findAll();
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
};

export const createNote = async (req, res) => {
  try {
    await Note.create(req.body);
    res.status(201).json({ msg: "Note created" });
  } catch (error) {
    console.log(error.message);
  }
};

export const getNotesById = async(req, res) => {
    try {
        const response = await Note.findOne({
            where:{
                id: req.params.id
            }
        });
        res.status(200).json(response);
    } catch (error) {
        console.log(error);
    }
}
export const updateNote = async (req, res) => {
  try {
    await Note.update(req.body, {
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "Note Updated" });
  } catch (error) {
    console.log(error.message);
  }
};

export const deleteNote = async (req, res) => {
  try {
    await Note.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json({ msg: "Note Deleted" });
  } catch (error) {
    console.log(error.message);
  }
};

// GET
async function getUsers(req, res) {
  try {
    const response = await User.findAll();
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
}

// GET BY ID
async function getUserById(req, res) {
  try {
    const response = await User.findOne({ where: { id: req.params.id } });
    res.status(200).json(response);
  } catch (error) {
    console.log(error.message);
  }
}

// REGISTER //baru nambahin pasword dan bcrypt
async function createUser(req, res) {
  try {
    const { name, email, gender, password } = req.body;
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email }, { name }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        status: "Failed",
        message: "Email atau Nama sudah digunakan",
      });
    }
    const encryptPassword = await bcrypt.hash(password, 5);
    const userPayload = { name, email, gender, rand: crypto.randomUUID() };
    const refreshToken = jwt.sign(
      userPayload,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    await User.create({
      name: name,
      email: email,
      gender: gender,
      password: encryptPassword,
      refresh_token: refreshToken,
    });
    res
      .status(201)
      .json({ msg: "Register Berhasil", refreshToken: refreshToken });
  } catch (error) {
    console.log(error.message);
  }
}

//baru nambahin case password
async function updateUser(req, res) {
  try {
    const { name, email, gender, password } = req.body;
    let updatedData = {
      name,
      email,
      gender,
    }; //nyimpen jadi object

    if (password) {
      const encryptPassword = await bcrypt.hash(password, 5);
      updatedData.password = encryptPassword;
    }

    const result = await User.update(updatedData, {
      where: {
        id: req.params.id,
      },
    });

    // Periksa apakah ada baris yang terpengaruh (diupdate)
    if (result[0] === 0) {
      return res.status(404).json({
        status: "failed",
        message: "User tidak ditemukan atau tidak ada data yang berubah",
        updatedData: updatedData,
        result,
      });
    }

    res.status(200).json({ msg: "User Updated" });
  } catch (error) {
    console.log(error.message);
  }
}

async function deleteUser(req, res) {
  try {
    await User.destroy({ where: { id: req.params.id } });
    res.status(201).json({ msg: "User Deleted" });
  } catch (error) {
    console.log(error.message);
  }
}

//Nambah fungsi buat login handler
async function loginHandler(req, res) {
  try {
    console.log("sudah masuk fungsi");
    const { email, password } = req.body;
    const user = await User.findOne({
      where: {
        email: email,
      },
    });
    
    if (user) {
      //Data User itu nanti bakalan dipake buat ngesign token kan
      // data user dari sequelize itu harus diubah dulu ke bentuk object
      //Safeuserdata dipake biar lebih dinamis, jadi dia masukin semua data user kecuali data-data sensitifnya  karena bisa didecode kayak password caranya gini :
      const userPlain = user.toJSON(); // Konversi ke object
      const { password: _, refresh_token: __, ...safeUserData } = userPlain;

      const decryptPassword = await bcrypt.compare(password, user.password);
      if (decryptPassword) {
        const accessToken = jwt.sign(
          safeUserData,
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "2h",
          }
        );
        const refreshToken = jwt.sign(
          safeUserData,
          process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: "1d",
          }
        );
        await User.update(
          { refresh_token: refreshToken },
          {
            where: {
              id: user.id,
            },
          }
        );
        res.cookie("refreshToken", refreshToken, {
          httpOnly: false, //ngatur cross-site scripting, untuk penggunaan asli aktifkan karena bisa nyegah serangan fetch data dari website "document.cookies"
          sameSite: "none", //ini ngatur domain yg request misal kalo strict cuman bisa akseske link dari dan menuju domain yg sama, lax itu bisa dari domain lain tapi cuman bisa get
          maxAge: 24 * 60 * 60 * 1000,
          secure: true, //ini ngirim cookies cuman bisa dari https, kenapa? nyegah skema MITM di jaringan publik, tapi pas development di false in aja
        });
        res.status(200).json({
          status: "Succes",
          message: "Login Berhasil",
          safeUserData,
          accessToken,
        });
      } else {
        res.status(400).json({
          status: "Failed",
          message: "Paassword atau email salah",
        });
      }
    } else {
      res.status(400).json({
        status: "Failed",
        message: "Paassword atau email salah",
      });
    }
  } catch (error) {
    res.status(error.statusCode || 500).json({
      status: "error",
      message: error.message,
    });
  }
}

//nambah logout
async function logout(req, res) {
  const refreshToken = req.cookies.refreshToken; //mgecek refresh token sama gak sama di database
  if (!refreshToken) return res.sendStatus(204);
  const user = await User.findOne({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user.refresh_token) return res.sendStatus(204);
  const userId = user.id;
  await User.update(
    { refresh_token: null },
    {
      where: {
        id: userId,
      },
    }
  );
  res.clearCookie("refreshToken"); //ngehapus cookies yg tersimpan
  return res.sendStatus(200);
}
export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginHandler,
  logout,
};
