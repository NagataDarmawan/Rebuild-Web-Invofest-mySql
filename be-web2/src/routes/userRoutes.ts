import express from 'express';

import {
    getAllUsers,
    createUser,
    getUserById,
    updateUserById,
    deleteUserById
} from "../controllers/userControllers.js";
const router = express.Router();
router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.put("/:id", updateUserById);
router.delete("/:id", deleteUserById);

export default router;