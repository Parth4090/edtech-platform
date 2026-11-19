import { Router } from 'express';
import { CatalogueController } from '../controllers/catalogue.controller';
import { optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/boards', CatalogueController.getBoards);
router.get('/classes', CatalogueController.getClasses);
router.get('/subjects', CatalogueController.getSubjects);
router.get('/subjects/:id', optionalAuthenticate, CatalogueController.getSubjectDetails);
router.get('/chapters/:id', optionalAuthenticate, CatalogueController.getChapterDetails);
router.get('/products', CatalogueController.getProducts);
router.get('/search', CatalogueController.search);

export default router;
