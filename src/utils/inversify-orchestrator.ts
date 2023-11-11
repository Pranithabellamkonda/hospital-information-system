import 'reflect-metadata';
import { Container } from 'inversify';
import { FileWriter } from './file-writer.js';
import { Logger } from './logger.js';
import { TYPES } from './types.js';
import { LogOutput } from '../classes/type-definitions.js';
import { Sequelize } from 'sequelize';

const createContainer = (): Container => {
  const container = new Container();

  const enableDebugMode = process.argv.some(arg => arg === 'debug');
  const logOutput = process.argv.some(arg => arg === 'file') ? LogOutput.file : LogOutput.console;
  const logger = new Logger(enableDebugMode, logOutput, new FileWriter());
  const dbConnection = new Sequelize('mysql://his_user:his_password_1234@localhost:3306/HIS');

  container.bind<Logger>(TYPES.Logger).toConstantValue(logger);
  container.bind<Sequelize>(TYPES.DbConnection).toConstantValue(dbConnection);

  return container;
};

export const container = createContainer();
