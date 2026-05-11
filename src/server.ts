import colors from 'colors';
import mongoose from 'mongoose';
import app from './app';
import config from './config';
import { seedSuperAdmin } from './DB/seedAdmin';
import { errorLogger, logger } from './shared/logger';

process.on('uncaughtException', error => {
  errorLogger.error('Uncaught Exception Detected', error);
  process.exit(1);
});

let server: any;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    logger.info(colors.green('🚀 Database connected successfully'));

    await seedSuperAdmin();

    const port =
      typeof config.port === 'number' ? config.port : Number(config.port);

    server = app.listen(port, config.ip_address as string, () => {
      logger.info(
        colors.yellow(`♻️  Application listening on port: ${config.port}`)
      );
    });
  } catch (error) {
    errorLogger.error(colors.red('🤢 Failed to connect to Database'), error);
  }

  process.on('unhandledRejection', error => {
    if (server) {
      server.close(() => {
        errorLogger.error('Unhandled Rejection Detected', error);
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
}

main();

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  if (server) {
    server.close();
  }
});
