import { ZodError } from 'zod';
import { IErrorMessage } from '../types/errors.types';

const handleZodError = (error: ZodError<any>) => {
  const errorMessages: IErrorMessage[] = error.issues.map(el => {
    const lastPath = el.path[el.path.length - 1];
    const safePath: string | number =
      typeof lastPath === 'symbol' ? String(lastPath) : lastPath;

    return {
      path: safePath,
      message: el.message,
    };
  });

  return {
    statusCode: 400,
    message: 'Validation Error',
    errorMessages,
  };
};

export default handleZodError;
