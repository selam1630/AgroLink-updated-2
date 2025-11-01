import { Router } from 'express';
import { 
  addProduct, 
  getAllProducts, 
  getProductById,
  updateProduct, 
  deleteProduct 
} from '../controllers/products.controller';
import { authenticateToken, protect } from '../middlewares/auth.middleware'; 
const router = Router();
router.post('/add-with-image', authenticateToken, protect(['admin']), addProduct);
router.get('/:id', authenticateToken, getProductById);
router.get('/', authenticateToken, getAllProducts);
router.put('/:id', authenticateToken, protect(['farmer', 'admin']), updateProduct);
router.delete('/:id', authenticateToken, protect(['farmer', 'admin']), deleteProduct);


export default router;