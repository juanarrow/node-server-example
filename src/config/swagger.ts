import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Determinar si estamos en dist/ o src/
const isCompiled = __dirname.includes('/dist/');
const projectRoot = isCompiled
  ? join(__dirname, '../../')  // desde dist/config/ subimos a raíz
  : join(__dirname, '../../');  // desde src/config/ subimos a raíz

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Express + PostgreSQL',
      version: '1.0.0',
      description: 'API REST con autenticación JWT, validación Zod, rate limiting y testing completo',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: 'Servidor de desarrollo',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID del usuario',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
            },
            name: {
              type: 'string',
              description: 'Nombre del usuario',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
          },
        },
        RegisterInput: {
          type: 'object',
          required: ['email', 'name', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Email del usuario',
            },
            name: {
              type: 'string',
              minLength: 2,
              description: 'Nombre del usuario',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Contraseña del usuario',
            },
          },
        },
        LoginInput: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            password: {
              type: 'string',
              minLength: 8,
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'JWT token',
            },
          },
        },
        UpdateProfileInput: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              format: 'email',
            },
            name: {
              type: 'string',
              minLength: 2,
            },
          },
        },
        ChangePasswordInput: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: {
              type: 'string',
            },
            newPassword: {
              type: 'string',
              minLength: 8,
            },
          },
        },
        Media: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID del media',
            },
            userId: {
              type: 'integer',
              description: 'ID del usuario propietario',
            },
            publicId: {
              type: 'string',
              description: 'ID público en Cloudinary',
            },
            secureUrl: {
              type: 'string',
              description: 'URL segura del archivo',
            },
            format: {
              type: 'string',
              description: 'Formato del archivo (jpg, png, mp4, etc)',
            },
            resourceType: {
              type: 'string',
              description: 'Tipo de recurso (image, video, raw, etc)',
            },
            bytes: {
              type: 'integer',
              description: 'Tamaño en bytes',
            },
            width: {
              type: 'integer',
              nullable: true,
              description: 'Ancho en píxeles',
            },
            height: {
              type: 'integer',
              nullable: true,
              description: 'Alto en píxeles',
            },
            originalName: {
              type: 'string',
              nullable: true,
              description: 'Nombre original del archivo',
            },
            folder: {
              type: 'string',
              nullable: true,
              description: 'Carpeta en Cloudinary',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Fecha de creación',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: 'Endpoints de autenticación',
      },
      {
        name: 'Users',
        description: 'Gestión de usuarios',
      },
      {
        name: 'Media',
        description: 'Gestión de archivos multimedia',
      },
    ],
  },
  apis: [join(__dirname, '../modules/**/*.routes.ts')],
};

export const swaggerSpec = swaggerJsdoc(options);

