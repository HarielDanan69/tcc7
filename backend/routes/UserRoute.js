import express from "express";
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserById,
  loginHandler,
  logout,
  getNotesById,
} from "../controllers/UserController.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import { verifyToken } from "../middleware/VerifyToken.js";

const router = express.Router();
router.get("/Notes", verifyToken, getNotes);
router.post("/Notes", verifyToken, createNote);
router.get("/Notes/:id", verifyToken, getNotesById);
router.patch("/Notes/:id", verifyToken, updateNote);
router.delete("/Notes/:id", verifyToken, deleteNote);

//endpoint akses token
router.get("/token", refreshToken);
//endpoin auth
router.post("/login", loginHandler);
router.delete("/logout", logout);

//endpoint data biasa
router.post("/register", createUser); //tambah user
router.get("/users", verifyToken, getUsers);

export default router;
