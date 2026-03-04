// src/modules/banner/banner.model.ts
import { Schema, model } from 'mongoose';
import { IBanner } from './banar.interface';

const bannerSchema = new Schema<IBanner>(
  {
    webBanners: [
      {
        image: { type: String,  },
      },
    ],
    mobileBanners: [
      {
        image: { type: String, },
      },
    ],
  },
  { timestamps: true }
);

const Banner = model<IBanner>('Banner', bannerSchema);

export default Banner;
