import routerx from 'express-promise-router';
import VentaController from '../controllers/VentaController';
import auth from '../middlewares/auth';

const router = routerx();

router.post('/add', auth.verifyVendedor, VentaController.add);
router.get('/query', auth.verifyVendedor, VentaController.query);
router.get('/list', auth.verifyVendedor, VentaController.list);
router.put('/activate', auth.verifyVendedor, VentaController.activate);
router.put('/deactivate', auth.verifyVendedor, VentaController.deactivate);

export default router;