import type { Request, Response } from 'express';
import * as mediaService from './media.service.js';
import { logger } from '../../utils/logger.js';

/**
 * POST /api/media/upload
 * Sube un archivo a Cloudinary
 */
export async function uploadCtrl(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const media = await mediaService.uploadMedia(req.user.sub, req.file);
    
    logger.info(`Usuario ${req.user.sub} subió archivo: ${media.publicId}`);
    
    res.status(201).json(media);
  } catch (error) {
    logger.error('Error en uploadCtrl:', error);
    res.status(500).json({ error: 'Error al subir el archivo' });
  }
}

/**
 * GET /api/media
 * Lista todos los medios del usuario autenticado
 */
export async function listCtrl(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const media = await mediaService.listUserMedia(req.user.sub);
    res.json(media);
  } catch (error) {
    logger.error('Error en listCtrl:', error);
    res.status(500).json({ error: 'Error al listar medios' });
  }
}

/**
 * GET /api/media/:id
 * Obtiene un medio por ID
 */
export async function getByIdCtrl(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const media = await mediaService.getMediaById(id);
    
    if (!media) {
      return res.status(404).json({ error: 'Media no encontrado' });
    }

    // Verificar que el media pertenece al usuario autenticado
    if (req.user && media.userId !== req.user.sub) {
      return res.status(403).json({ error: 'No autorizado' });
    }

    res.json(media);
  } catch (error) {
    logger.error('Error en getByIdCtrl:', error);
    res.status(500).json({ error: 'Error al obtener el media' });
  }
}

/**
 * DELETE /api/media/:id
 * Elimina un medio de Cloudinary y de la base de datos
 */
export async function deleteCtrl(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const deleted = await mediaService.deleteMedia(id, req.user.sub);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Media no encontrado o no autorizado' });
    }

    logger.info(`Usuario ${req.user.sub} eliminó media ${id}`);
    
    res.status(204).send();
  } catch (error) {
    logger.error('Error en deleteCtrl:', error);
    res.status(500).json({ error: 'Error al eliminar el media' });
  }
}

