import { Router } from 'express';
import multer from 'multer';
import { auth } from '../../middleware/auth.js';
import { uploadCtrl, listCtrl, getByIdCtrl, deleteCtrl } from './media.controller.js';

const router = Router();

// Configurar multer para almacenar archivos en memoria
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo imágenes y videos
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido'));
    }
  },
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Media:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         publicId:
 *           type: string
 *         secureUrl:
 *           type: string
 *         format:
 *           type: string
 *         resourceType:
 *           type: string
 *         bytes:
 *           type: integer
 *         width:
 *           type: integer
 *           nullable: true
 *         height:
 *           type: integer
 *           nullable: true
 *         originalName:
 *           type: string
 *           nullable: true
 *         folder:
 *           type: string
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/media/upload:
 *   post:
 *     summary: Sube un archivo a Cloudinary
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a subir (imagen o video, máx 10MB)
 *     responses:
 *       201:
 *         description: Archivo subido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 *       400:
 *         description: No se proporcionó archivo o tipo no permitido
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.post('/upload', auth, upload.single('file'), uploadCtrl);

/**
 * @swagger
 * /api/media:
 *   get:
 *     summary: Lista todos los medios del usuario autenticado
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de medios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Media'
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/', auth, listCtrl);

/**
 * @swagger
 * /api/media/{id}:
 *   get:
 *     summary: Obtiene un medio por ID
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del media
 *     responses:
 *       200:
 *         description: Detalle del media
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Media'
 *       400:
 *         description: ID inválido
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Media no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', auth, getByIdCtrl);

/**
 * @swagger
 * /api/media/{id}:
 *   delete:
 *     summary: Elimina un medio de Cloudinary y de la base de datos
 *     tags: [Media]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del media
 *     responses:
 *       204:
 *         description: Media eliminado exitosamente
 *       400:
 *         description: ID inválido
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Media no encontrado o no autorizado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', auth, deleteCtrl);

export default router;

