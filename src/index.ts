import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

// En Vercel (serverless), exportamos la app directamente
// En entornos tradicionales (Docker, Railway), iniciamos el servidor
if (!process.env.VERCEL) {
  // Modo tradicional: Servidor persistente
  const server = app.listen(env.PORT, () => {
    logger.info(`API escuchando en http://localhost:${env.PORT}`);
    logger.info(`Entorno: ${env.NODE_ENV}`);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM recibido, cerrando servidor...');
    server.close(() => {
      logger.info('Servidor cerrado');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT recibido, cerrando servidor...');
    server.close(() => {
      logger.info('Servidor cerrado');
      process.exit(0);
    });
  });
}

// Export para Vercel (serverless)
export default app;

