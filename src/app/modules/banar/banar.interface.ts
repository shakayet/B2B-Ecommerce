// src/modules/banner/banner.interface.ts
export interface IBanner {
  webBanners?: { image: string,_id?: string; }[];
  mobileBanners?: { image: string,_id?: string; }[];
  createdAt?: Date;
  updatedAt?: Date;
}
