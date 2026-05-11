import cors from 'cors';
import express, { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
const app = express();

app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://10.10.7.100:3000',
      'http://10.10.7.101:3000',
      'https://www.unifiedproduces.com',
      'https://unifiedproduces.com',
      'https://photograph-hospital-organised-curious.trycloudflare.com',
    ],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('uploads'));

app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  const date = new Date(Date.now());
  res.send(
    `<h1 style="text-align:center; color:#173616; font-family:Verdana;">Beep-beep! The server is alive and kicking.</h1>
    <p style="text-align:center; color:#173616; font-family:Verdana;">${date}</p>
    `,
  );
});

app.use(globalErrorHandler);

app.use((req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    success: false,
    message: 'Not found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API DOESN'T EXIST",
      },
    ],
  });
});

export default app;
