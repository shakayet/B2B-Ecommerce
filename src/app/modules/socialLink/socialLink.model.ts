import { model, Schema } from 'mongoose';
interface ISocialLink {
  name: string;
  socialLink: string;
}

const socialLinkSchema = new Schema<ISocialLink>(
  {
    name: { type: String },
    socialLink: { type: String },
  },
  { timestamps: true },
);

export const SocialLink = model<ISocialLink>('SocialLink', socialLinkSchema);
