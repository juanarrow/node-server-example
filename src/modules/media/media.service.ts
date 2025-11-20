import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../../config/db.js';
import { env } from '../../config/env.js';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  id: number;
  publicId: string;
  secureUrl: string;
  format: string;
  resourceType: string;
  bytes: number;
  width: number | null;
  height: number | null;
  originalName: string | null;
  folder: string | null;
  createdAt: Date;
}

/**
 * Sube un archivo a Cloudinary y guarda el registro en la base de datos
 */
export async function uploadMedia(
  userId: number,
  file: Express.Multer.File
): Promise<UploadResult> {
  // Subir a Cloudinary
  const result = await new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `user_${userId}`,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(file.buffer);
  });

  // Guardar en base de datos
  const media = await prisma.media.create({
    data: {
      userId,
      publicId: result.public_id,
      secureUrl: result.secure_url,
      format: result.format,
      resourceType: result.resource_type,
      bytes: result.bytes,
      width: result.width || null,
      height: result.height || null,
      originalName: file.originalname,
      folder: result.folder || null,
    },
  });

  return media;
}

/**
 * Lista todos los medios del usuario
 */
export async function listUserMedia(userId: number) {
  return prisma.media.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Obtiene un medio por ID
 */
export async function getMediaById(id: number) {
  return prisma.media.findUnique({
    where: { id },
  });
}

/**
 * Elimina un medio de Cloudinary y de la base de datos
 */
export async function deleteMedia(id: number, userId: number): Promise<boolean> {
  // Verificar que el media pertenece al usuario
  const media = await prisma.media.findFirst({
    where: { id, userId },
  });

  if (!media) {
    return false;
  }

  // Eliminar de Cloudinary
  await cloudinary.uploader.destroy(media.publicId);

  // Eliminar de base de datos
  await prisma.media.delete({
    where: { id },
  });

  return true;
}

