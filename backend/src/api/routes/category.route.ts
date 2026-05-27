import { Router } from "express";
import { CategoryController } from "../controllers/category.controller.js";
import { protect } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { CategorySchema } from "../../core/dtos/category.dto.js";

const router = Router();

router.get('/', protect, CategoryController.getCategories);
router.post('/', protect, validate(CategorySchema), CategoryController.createCategory);
router.put('/:id', protect, validate(CategorySchema), CategoryController.updateCategory);
router.delete('/:id', protect, CategoryController.deleteCategory);

export default router;
